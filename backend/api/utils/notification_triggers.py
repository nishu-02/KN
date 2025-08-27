import logging
from typing import List, Optional
from utils.notification_service import NotificationService
from users.models import PushToken, UserProfile
from ngo.models import NGO

logger = logging.getLogger('notifications')

def _get_tokens_for_user(appwrite_user_id: str, user_type: str) -> List[str]:
    """Helper function to get active push tokens for a user."""
    return list(PushToken.objects.filter(
        appwrite_user_id=appwrite_user_id,
        user_type=user_type,
        is_active=True
    ).values_list('token', flat=True))

def _send_notification_safely(payload: dict, context: str = ""):
    """Helper function to send notifications with error handling."""
    try:
        notification_service = NotificationService()
        result = notification_service.send_notification(payload)
        logger.info(f"Notification sent successfully {context}: {payload.get('title', 'Unknown')}")
        return result
    except Exception as e:
        logger.error(f"Failed to send notification {context}: {e}")
        return None

def notify_report_assigned_to_ngo(report, ngo):
    """
    Notify the NGO when a report has been assigned to them.
    """
    tokens = _get_tokens_for_user(ngo.appwrite_user_id, 'ngo')
    if not tokens:
        logger.warning(f"No push tokens found for NGO {ngo.appwrite_user_id}")
        return
    
    payload = {
        "tokens": tokens,
        "title": "Report Assigned",
        "body": f"A new report (ID: {report.report_id}) has been assigned to your NGO.",
        "type": "status_update",
        "recipient_user_id": ngo.appwrite_user_id,
        "data": {
            "report_id": str(report.report_id),
            "status": report.status,
            "action": "report_assigned"
        }
    }
    _send_notification_safely(payload, f"for report assignment to NGO {ngo.id}")

def notify_report_assigned_to_volunteer(report, volunteer_profile):
    """
    Notify the volunteer when a report has been assigned to them.
    """
    tokens = _get_tokens_for_user(volunteer_profile.appwrite_user_id, 'user')
    if not tokens:
        logger.warning(f"No push tokens found for volunteer {volunteer_profile.appwrite_user_id}")
        return
    
    payload = {
        "tokens": tokens,
        "title": "Report Assigned",
        "body": f"You have accepted report {report.report_id}. Help is on the way!",
        "type": "status_update",
        "recipient_user_id": volunteer_profile.appwrite_user_id,
        "data": {
            "report_id": str(report.report_id),
            "status": report.status,
            "action": "report_assigned_volunteer"
        }
    }
    _send_notification_safely(payload, f"for report assignment to volunteer {volunteer_profile.appwrite_user_id}")

def notify_emergency_alert(report_id: str, location: str, latitude: Optional[float] = None, longitude: Optional[float] = None):
    """Notify all users about an emergency alert."""
    tokens = list(PushToken.objects.filter(is_active=True).values_list('token', flat=True))
    if not tokens:
        logger.warning("No active push tokens found for emergency alert")
        return
    
    data = {
        "report_id": str(report_id),
        "location": location,
        "action": "emergency_alert"
    }
    
    if latitude and longitude:
        data.update({"latitude": latitude, "longitude": longitude})
    
    payload = {
        "type": "emergency",
        "tokens": tokens,
        "title": "🚨 Emergency Alert!",
        "body": f"Emergency reported at {location}. Immediate assistance required!",
        "data": data
    }
    _send_notification_safely(payload, f"for emergency at {location}")

def notify_volunteer_applied(application):
    """Notify NGO when a user applies to volunteer."""
    ngo = application.ngo
    tokens = _get_tokens_for_user(ngo.appwrite_user_id, 'ngo')
    if not tokens:
        logger.warning(f"No push tokens found for NGO {ngo.appwrite_user_id}")
        return
    
    payload = {
        "type": "volunteer",
        "tokens": tokens,
        "title": "New Volunteer Application",
        "body": f"A new volunteer has applied to join your NGO.",
        "recipient_user_id": ngo.appwrite_user_id,
        "data": {
            "application_id": str(application.id),
            "user_id": str(application.user.id),
            "action": "volunteer_applied"
        }
    }
    _send_notification_safely(payload, f"for volunteer application to NGO {ngo.id}")

def notify_volunteer_accepted(application):
    """Notify user when their volunteer application is accepted."""
    user = application.user
    try:
        user_profile = UserProfile.objects.get(user=user)
        appwrite_user_id = user_profile.appwrite_user_id
    except UserProfile.DoesNotExist:
        logger.warning(f"UserProfile not found for user {user.id}")
        return
    
    tokens = _get_tokens_for_user(appwrite_user_id, 'user')
    if not tokens:
        logger.warning(f"No push tokens found for user {appwrite_user_id}")
        return
    
    payload = {
        "type": "volunteer",
        "tokens": tokens,
        "title": "🎉 Application Accepted!",
        "body": f"Congratulations! Your volunteer application has been accepted by {application.ngo.name}.",
        "recipient_user_id": appwrite_user_id,
        "data": {
            "application_id": str(application.id),
            "ngo_id": str(application.ngo.id),
            "ngo_name": application.ngo.name,
            "action": "volunteer_accepted"
        }
    }
    _send_notification_safely(payload, f"for volunteer acceptance to user {user.id}")

def notify_injury_report_created(report):
    """Notify all NGOs and volunteer users about a new injury report."""
    # Get all NGO tokens
    ngo_tokens = list(PushToken.objects.filter(
        user_type='ngo', 
        is_active=True
    ).values_list('token', flat=True))
    
    # Get tokens for users with volunteer status
    volunteer_user_ids = UserProfile.objects.filter(
        is_volunteer=True
    ).values_list('appwrite_user_id', flat=True)
    
    volunteer_tokens = list(PushToken.objects.filter(
        appwrite_user_id__in=volunteer_user_ids,
        user_type='user',
        is_active=True
    ).values_list('token', flat=True))
    
    # Exclude the report creator's tokens
    creator_tokens = list(PushToken.objects.filter(
        appwrite_user_id=str(report.user_id),
        is_active=True
    ).values_list('token', flat=True))

    # Combine and deduplicate tokens, then exclude creator's tokens
    all_tokens = list(set(ngo_tokens + volunteer_tokens) - set(creator_tokens))
    if not all_tokens:
        logger.warning("No push tokens found for injury report notification (excluding creator)")
        return

    payload = {
        "type": "injury_report",
        "tokens": all_tokens,
        "title": "🩹 New Injury Report",
        "body": f"A new injury report has been submitted and requires attention.",
        "data": {
            "report_id": str(report.report_id),
            "action": "injury_report_created"
        }
    }
    _send_notification_safely(payload, f"for injury report {report.report_id}")

    payload = {
        "type": "injury_report",
        "tokens": all_tokens,
        "title": "🩹 New Injury Report",
        "body": f"A new injury report has been submitted and requires attention.",
        "data": {
            "report_id": str(report.report_id),
            "action": "injury_report_created"
        }
    }
    _send_notification_safely(payload, f"for injury report {report.report_id}")

def notify_report_status_update(report, old_status: str, new_status: str):
    """Notify relevant users when a report status changes."""
    # This function can be extended based on your specific business logic
    # For now, we'll notify the reporter if they have a user profile
    
    if hasattr(report, 'reporter_user_id') and report.reporter_user_id:
        tokens = _get_tokens_for_user(report.reporter_user_id, 'user')
        if tokens:
            payload = {
                "type": "status_update",
                "tokens": tokens,
                "title": "Report Status Updated",
                "body": f"Your report status has been updated from {old_status} to {new_status}.",
                "recipient_user_id": report.reporter_user_id,
                "data": {
                    "report_id": str(report.report_id),
                    "old_status": old_status,
                    "new_status": new_status,
                    "action": "status_updated"
                }
            }
            _send_notification_safely(payload, f"for status update on report {report.report_id}")

# Utility function for custom notifications
def send_custom_notification(user_ids: List[str], title: str, body: str, 
                           notification_type: str = "general", data: dict = None):
    """Send a custom notification to specific users."""
    if not user_ids:
        return
        
    tokens = list(PushToken.objects.filter(
        appwrite_user_id__in=user_ids,
        is_active=True
    ).values_list('token', flat=True))
    
    if not tokens:
        logger.warning(f"No push tokens found for users: {user_ids}")
        return
    
    payload = {
        "type": notification_type,
        "tokens": tokens,
        "title": title,
        "body": body,
        "data": data or {}
    }
    _send_notification_safely(payload, f"custom notification to {len(user_ids)} users")


