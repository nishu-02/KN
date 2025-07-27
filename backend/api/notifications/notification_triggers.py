from typing import Dict, List, Optional
from .notification_service import AppwriteNotificationService
from .utils import send_and_log_notification
from users.models import UserProfile, VolunteerApplication
from ngo.models import NGO
from reports.models import InjuryReport, ReportStatusHistory
import uuid
import time


class NotificationTriggers:
    """
    Centralized notification triggers for all system events
    """
    
    def __init__(self):
        self.appwrite_service = AppwriteNotificationService()
    
    def notify_volunteer_application_submitted(self, application: VolunteerApplication):
        """
        Notify NGO when a user applies to become a volunteer
        """
        try:
            # Get user profile for better notification content
            user_profile = UserProfile.objects.filter(appwrite_user_id=application.user_id).first()
            user_name = user_profile.name if user_profile else "A user"
            
            # Notify the NGO
            send_and_log_notification(
                recipient_id=application.ngo.appwrite_user_id,
                recipient_type="ngo",
                title="New Volunteer Application",
                body=f"{user_name} has applied to become a volunteer for {application.ngo.name}",
                data={
                    "type": "volunteer_application",
                    "application_id": str(application.id),
                    "user_id": application.user_id,
                    "user_name": user_name,
                    "ngo_id": str(application.ngo.ngo_id),
                    "status": "pending"
                }
            )
            
            # Also send via Appwrite for real-time push notifications
            self.appwrite_service.send_push_notifications(
                topic='volunteer_updates',
                title="New Volunteer Application",
                body=f"{user_name} has applied to become a volunteer",
                data={
                    "type": "volunteer_application",
                    "application_id": str(application.id),
                    "user_id": application.user_id,
                    "ngo_id": str(application.ngo.ngo_id)
                },
                user_ids=[application.ngo.appwrite_user_id]
            )
            
        except Exception as e:
            print(f"Error sending volunteer application notification: {e}")
    
    def notify_volunteer_application_status_update(self, application: VolunteerApplication, old_status: str):
        """
        Notify user when their volunteer application is accepted or rejected
        """
        try:
            status_text = "accepted" if application.status == "accepted" else "rejected"
            
            # Notify the user
            send_and_log_notification(
                recipient_id=application.user_id,
                recipient_type="user",
                title=f"Volunteer Application {status_text.title()}",
                body=f"Your volunteer application for {application.ngo.name} has been {status_text}",
                data={
                    "type": "volunteer_application_status",
                    "application_id": str(application.id),
                    "ngo_id": str(application.ngo.ngo_id),
                    "ngo_name": application.ngo.name,
                    "status": application.status,
                    "old_status": old_status
                }
            )
            
            # Send push notification
            self.appwrite_service.send_push_notifications(
                topic='volunteer_updates',
                title=f"Application {status_text.title()}",
                body=f"Your volunteer application for {application.ngo.name} has been {status_text}",
                data={
                    "type": "volunteer_application_status",
                    "application_id": str(application.id),
                    "ngo_id": str(application.ngo.ngo_id),
                    "status": application.status
                },
                user_ids=[application.user_id]
            )
            
        except Exception as e:
            print(f"Error sending volunteer application status notification: {e}")
    
    def notify_injury_report_status_change(self, report: InjuryReport, old_status: str, new_status: str):
        """
        Notify user when their injury report status changes
        """
        try:
            status_messages = {
                'pending': 'Your report is pending review',
                'in_progress': 'Your report is now being handled by an NGO',
                'resolved': 'Your report has been resolved',
                'cancelled': 'Your report has been cancelled'
            }
            
            message = status_messages.get(new_status, f"Your report status has been updated to {new_status}")
            
            # Notify the user who reported
            send_and_log_notification(
                recipient_id=report.user_id,
                recipient_type="user",
                title="Report Status Updated",
                body=message,
                data={
                    "type": "injury_report_status",
                    "report_id": str(report.report_id),
                    "old_status": old_status,
                    "new_status": new_status,
                    "location": report.location
                },
                report=report
            )
            
            # Send push notification
            self.appwrite_service.send_push_notifications(
                topic='injury_reports',
                title="Report Status Updated",
                body=message,
                data={
                    "type": "injury_report_status",
                    "report_id": str(report.report_id),
                    "old_status": old_status,
                    "new_status": new_status
                },
                user_ids=[report.user_id]
            )
            
            # If NGO is assigned, also notify them
            if report.ngo_assigned and new_status in ['in_progress', 'resolved']:
                ngo_message = f"Report at {report.location} status updated to {new_status}"
                
                send_and_log_notification(
                    recipient_id=report.ngo_assigned.appwrite_user_id,
                    recipient_type="ngo",
                    title="Assigned Report Updated",
                    body=ngo_message,
                    data={
                        "type": "assigned_report_status",
                        "report_id": str(report.report_id),
                        "new_status": new_status,
                        "location": report.location
                    },
                    report=report
                )
                
                self.appwrite_service.send_push_notifications(
                    topic='injury_reports',
                    title="Assigned Report Updated",
                    body=ngo_message,
                    data={
                        "type": "assigned_report_status",
                        "report_id": str(report.report_id),
                        "new_status": new_status
                    },
                    user_ids=[report.ngo_assigned.appwrite_user_id]
                )
            
        except Exception as e:
            print(f"Error sending injury report status notification: {e}")
    
    def notify_new_injury_report(self, report: InjuryReport):
        """
        Notify relevant NGOs about a new injury report in their area
        """
        try:
            # Find nearby NGOs (within 10km radius)
            nearby_ngos = NGO.objects.filter(
                latitude__range=(report.latitude - 0.1, report.latitude + 0.1),
                longitude__range=(report.longitude - 0.1, report.longitude + 0.1)
            )
            
            for ngo in nearby_ngos:
                send_and_log_notification(
                    recipient_id=ngo.appwrite_user_id,
                    recipient_type="ngo",
                    title="New Emergency Report",
                    body=f"New injury report at {report.location} - Immediate attention required",
                    data={
                        "type": "new_injury_report",
                        "report_id": str(report.report_id),
                        "location": report.location,
                        "latitude": report.latitude,
                        "longitude": report.longitude,
                        "urgency": "high"
                    },
                    report=report
                )
            
            # Send to all NGOs via topic for broader reach
            self.appwrite_service.send_push_notifications(
                topic='emergency_alerts',
                title="New Emergency Report",
                body=f"New injury report at {report.location} - Immediate attention required",
                data={
                    "type": "new_injury_report",
                    "report_id": str(report.report_id),
                    "location": report.location,
                    "urgency": "high"
                }
            )
            
        except Exception as e:
            print(f"Error sending new injury report notification: {e}")
    
    def notify_report_assigned_to_ngo(self, report: InjuryReport, ngo: NGO):
        """
        Notify NGO when they accept a report and notify the user
        """
        try:
            # Notify the NGO
            ngo_message = f"You have accepted a report at {report.location}"
            
            send_and_log_notification(
                recipient_id=ngo.appwrite_user_id,
                recipient_type="ngo",
                title="Report Assigned",
                body=ngo_message,
                data={
                    "type": "report_assigned",
                    "report_id": str(report.report_id),
                    "location": report.location,
                    "user_id": report.user_id
                },
                report=report
            )
            
            # Notify the user
            user_message = f"Your report at {report.location} has been accepted by {ngo.name}"
            
            send_and_log_notification(
                recipient_id=report.user_id,
                recipient_type="user",
                title="Report Accepted",
                body=user_message,
                data={
                    "type": "report_accepted",
                    "report_id": str(report.report_id),
                    "ngo_id": str(ngo.ngo_id),
                    "ngo_name": ngo.name,
                    "location": report.location
                },
                report=report
            )
            
            # Send push notifications
            self.appwrite_service.send_push_notifications(
                topic='injury_reports',
                title="Report Assigned",
                body=ngo_message,
                data={
                    "type": "report_assigned",
                    "report_id": str(report.report_id)
                },
                user_ids=[ngo.appwrite_user_id]
            )
            
            self.appwrite_service.send_push_notifications(
                topic='injury_reports',
                title="Report Accepted",
                body=user_message,
                data={
                    "type": "report_accepted",
                    "report_id": str(report.report_id)
                },
                user_ids=[report.user_id]
            )
            
        except Exception as e:
            print(f"Error sending report assignment notification: {e}")
    
    def notify_volunteer_assigned(self, report: InjuryReport, volunteer: UserProfile):
        """
        Notify volunteer when they are assigned to a report
        """
        try:
            volunteer_message = f"You have been assigned to help with a report at {report.location}"
            
            send_and_log_notification(
                recipient_id=volunteer.appwrite_user_id,
                recipient_type="user",
                title="Volunteer Assignment",
                body=volunteer_message,
                data={
                    "type": "volunteer_assigned",
                    "report_id": str(report.report_id),
                    "location": report.location,
                    "urgency": "high"
                },
                report=report
            )
            
            self.appwrite_service.send_push_notifications(
                topic='volunteer_updates',
                title="Volunteer Assignment",
                body=volunteer_message,
                data={
                    "type": "volunteer_assigned",
                    "report_id": str(report.report_id),
                    "location": report.location
                },
                user_ids=[volunteer.appwrite_user_id]
            )
            
        except Exception as e:
            print(f"Error sending volunteer assignment notification: {e}")
    
    def notify_emergency_alert(self, report: InjuryReport, message: str, priority: str = "high"):
        """
        Send emergency alerts for critical situations
        """
        try:
            self.appwrite_service.send_push_notifications(
                topic='emergency_alerts',
                title="🚨 Emergency Alert",
                body=message,
                data={
                    "type": "emergency_alert",
                    "report_id": str(report.report_id),
                    "location": report.location,
                    "priority": priority,
                    "timestamp": str(int(time.time()))
                }
            )
            
        except Exception as e:
            print(f"Error sending emergency alert: {e}")
    
    def notify_general_announcement(self, title: str, body: str, user_ids: List[str] = None, topic: str = "general"):
        """
        Send general announcements to users or topics
        """
        try:
            if user_ids:
                for user_id in user_ids:
                    send_and_log_notification(
                        recipient_id=user_id,
                        recipient_type="user",
                        title=title,
                        body=body,
                        data={"type": "announcement"}
                    )
                
                self.appwrite_service.send_push_notifications(
                    topic=topic,
                    title=title,
                    body=body,
                    data={"type": "announcement"},
                    user_ids=user_ids
                )
            else:
                self.appwrite_service.send_push_notifications(
                    topic=topic,
                    title=title,
                    body=body,
                    data={"type": "announcement"}
                )
                
        except Exception as e:
            print(f"Error sending general announcement: {e}")


# Global instance for easy access
notification_triggers = NotificationTriggers() 