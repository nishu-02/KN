from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.utils import timezone

from .production_notification_service import (
    notification_service, 
    send_emergency_alert, 
    send_status_update, 
    send_injury_report_notification, 
    send_general_announcement,
    register_device,
    update_notification_preferences
)
from .models import NotificationHistory
from users.models import UserProfile

class NotificationViewSet(viewsets.ViewSet):
    """
    PRODUCTION NOTIFICATION API
    Complete notification system for KarunaNidhan app
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='register-device')
    def register_device(self, request):
        """Register device and save push token with preferences"""
        try:
            push_token = request.data.get('push_token')
            device_id = request.data.get('device_id', '')
            platform = request.data.get('platform', '')
            user_id = getattr(request.user, 'appwrite_user_id', str(request.user.id))
            
            if not push_token:
                return Response({
                    "error": "Push token is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Register device
            success = register_device(user_id, push_token, device_id, platform)
            
            if success:
                # Get user preferences to return
                try:
                    user_profile = UserProfile.objects.get(appwrite_user_id=user_id)
                    preferences = user_profile.notification_preferences or user_profile.get_default_notification_preferences()
                except UserProfile.DoesNotExist:
                    preferences = {
                        'emergency_alerts': True,
                        'status_updates': True, 
                        'general_announcements': True,
                        'injury_reports': False
                    }
                
                return Response({
                    "message": "Device registered successfully",
                    "user_id": user_id,
                    "notification_preferences": preferences
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Failed to register device"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='update-preferences')
    def update_notification_preferences(self, request):
        """Update user notification preferences"""
        try:
            user_id = getattr(request.user, 'appwrite_user_id', str(request.user.id))
            preferences = request.data.get('preferences', {})
            
            if not preferences:
                return Response({
                    "error": "Preferences are required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            success = update_notification_preferences(user_id, preferences)
            
            if success:
                # Return updated preferences
                user_profile = UserProfile.objects.get(appwrite_user_id=user_id)
                return Response({
                    "message": "Preferences updated successfully",
                    "notification_preferences": user_profile.notification_preferences
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Failed to update preferences"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='preferences')
    def get_notification_preferences(self, request):
        """Get user notification preferences"""
        try:
            user_id = getattr(request.user, 'appwrite_user_id', str(request.user.id))
            
            try:
                user_profile = UserProfile.objects.get(appwrite_user_id=user_id)
                preferences = user_profile.notification_preferences or user_profile.get_default_notification_preferences()
            except UserProfile.DoesNotExist:
                preferences = {
                    'emergency_alerts': True,
                    'status_updates': True,
                    'general_announcements': True, 
                    'injury_reports': False
                }
            
            return Response({
                "notification_preferences": preferences
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='send-test')
    def send_test_notification(self, request):
        """Send test notification to current user"""
        try:
            user_id = getattr(request.user, 'appwrite_user_id', str(request.user.id))
            
            # Check if user has registered push tokens
            from users.models import UserPushToken
            tokens = UserPushToken.objects.filter(
                is_active=True,
                user__appwrite_user_id=user_id
            ).count()
            
            if tokens == 0:
                return Response({
                    "error": "No push tokens registered. Please enable notifications in your app settings first.",
                    "instructions": "Go to Settings → Notifications → Enable Push Notifications"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            success = send_general_announcement(
                title="🧪 Test Notification",
                body="Your notification system is working perfectly!",
                user_ids=[user_id]
            )
            
            if success:
                return Response({
                    "message": f"Test notification sent successfully to {tokens} device(s)",
                    "devices_count": tokens
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Failed to send test notification - no active devices found"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='send-emergency')
    def send_emergency_notification(self, request):
        """Send emergency notification to all users"""
        try:
            report_id = request.data.get('report_id')
            location = request.data.get('location')
            description = request.data.get('description', '')
            
            if not report_id or not location:
                return Response({
                    "error": "report_id and location are required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            success = send_emergency_alert(report_id, location, description)
            
            if success:
                return Response({
                    "message": "Emergency notification sent successfully"
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Failed to send emergency notification"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='send-injury-report')
    def send_injury_report_notification(self, request):
        """Send injury report notification to volunteers and NGOs"""
        try:
            report_id = request.data.get('report_id')
            location = request.data.get('location')
            description = request.data.get('description', '')
            
            if not report_id or not location:
                return Response({
                    "error": "report_id and location are required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            success = send_injury_report_notification(report_id, location, description)
            
            if success:
                return Response({
                    "message": "Injury report notification sent successfully"
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Failed to send injury report notification"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='send-status-update')
    def send_status_notification(self, request):
        """Send status update notification to specific user"""
        try:
            user_id = request.data.get('user_id')
            report_id = request.data.get('report_id')
            new_status = request.data.get('new_status')
            location = request.data.get('location', '')
            
            if not all([user_id, report_id, new_status]):
                return Response({
                    "error": "user_id, report_id, and new_status are required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            success = send_status_update(user_id, report_id, new_status, location)
            
            if success:
                return Response({
                    "message": "Status notification sent successfully"
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Failed to send status notification"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='send-announcement')
    def send_announcement(self, request):
        """Send general announcement"""
        try:
            title = request.data.get('title')
            body = request.data.get('body')
            user_ids = request.data.get('user_ids')  # Optional - if None, sends to all
            
            if not title or not body:
                return Response({
                    "error": "title and body are required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            success = send_general_announcement(title, body, user_ids)
            
            if success:
                return Response({
                    "message": "Announcement sent successfully"
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Failed to send announcement"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='history')
    def get_notification_history(self, request):
        """Get notification history for current user"""
        try:
            user_id = getattr(request.user, 'appwrite_user_id', str(request.user.id))
            page_size = min(int(request.query_params.get('page_size', 50)), 100)
            
            notifications = NotificationHistory.objects.filter(
                recipient_id=user_id
            ).order_by('-created_at')[:page_size]
            
            history = []
            for notif in notifications:
                history.append({
                    'id': str(notif.notification_id),
                    'type': notif.notification_type,
                    'title': notif.title,
                    'body': notif.body,
                    'data': notif.data,
                    'is_read': notif.is_read,
                    'is_urgent': notif.is_urgent,
                    'created_at': notif.created_at.isoformat(),
                    'sent_at': notif.sent_at.isoformat() if notif.sent_at else None,
                    'read_at': notif.read_at.isoformat() if notif.read_at else None
                })
            
            return Response({
                "notifications": history,
                "count": len(history)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['patch'], url_path='mark-read')
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        try:
            user_id = getattr(request.user, 'appwrite_user_id', str(request.user.id))
            
            notification = NotificationHistory.objects.get(
                notification_id=pk,
                recipient_id=user_id
            )
            
            if not notification.is_read:
                notification.is_read = True
                notification.read_at = timezone.now()
                notification.save(update_fields=['is_read', 'read_at'])
            
            return Response({
                "message": "Notification marked as read",
                "read_at": notification.read_at.isoformat()
            }, status=status.HTTP_200_OK)
            
        except NotificationHistory.DoesNotExist:
            return Response({
                "error": "Notification not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['patch'], url_path='mark-all-read')
    def mark_all_as_read(self, request):
        """Mark all notifications as read for current user"""
        try:
            user_id = getattr(request.user, 'appwrite_user_id', str(request.user.id))
            
            updated_count = NotificationHistory.objects.filter(
                recipient_id=user_id,
                is_read=False
            ).update(
                is_read=True,
                read_at=timezone.now()
            )
            
            return Response({
                "message": f"Marked {updated_count} notifications as read"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Utility functions for backward compatibility
def send_injury_report_notification_compat(injury_report):
    """Backward compatible function for injury reports"""
    location = getattr(injury_report, 'location', 'Unknown location')
    description = getattr(injury_report, 'description', '')
    return send_injury_report_notification(str(injury_report.report_id), location, description)

def send_volunteer_assigned_notification(volunteer_id, injury_report):
    """Send notification when volunteer is assigned"""
    location = getattr(injury_report, 'location', 'Unknown location')
    return send_status_update(volunteer_id, str(injury_report.report_id), 'assigned', location)

    @action(detail=True, methods=['patch'], url_path='mark-read')
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        try:
            user_id = str(request.user.id)
            
            notification = NotificationHistory.objects.get(
                notification_id=pk,
                recipient_id=user_id
            )
            notification.is_read = True
            notification.save()
            
            return Response({
                "message": "Notification marked as read"
            }, status=status.HTTP_200_OK)
            
        except NotificationHistory.DoesNotExist:
            return Response({
                "error": "Notification not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Utility methods for sending notifications (keeping for backward compatibility)
def send_injury_report_notification(injury_report):
    """Send notification for a new injury report"""
    send_emergency_alert(injury_report.id, getattr(injury_report, 'location', 'Unknown location'))

def send_volunteer_assigned_notification(volunteer_id, injury_report):
    """Send notification when a volunteer is assigned to an injury report"""
    send_status_update(
        volunteer_id,
        injury_report.id,
        'assigned',
        getattr(injury_report, 'location', 'Unknown location')
    )
