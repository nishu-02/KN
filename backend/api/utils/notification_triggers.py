from utils.notification_service import NotificationService
from users.models import UserPushToken

# Example: send notification to all tokens for a user

def notify_report_assigned_to_ngo(report, ngo):
    """
    Notify the NGO and the user that a report has been assigned.
    """
    notification_service = NotificationService()
    # Fetch all push tokens for the NGO user
    tokens = list(UserPushToken.objects.filter(user=ngo.user).values_list('token', flat=True))
    if not tokens:
        return
    payload = {
        "tokens": tokens,
        "title": "Report Assigned",
        "body": f"A new report (ID: {report.report_id}) has been assigned to your NGO.",
        "data": {
            "report_id": str(report.report_id),
            "status": report.status,
        }
    }
    try:
        notification_service.send_notification(payload)
    except Exception as e:
        # Log error or handle as needed
        pass

from users.models import UserPushToken, UserProfile
from ngo.models import NGO

# --- Notification Triggers for All Four Types ---

def notify_emergency_alert(report_id, location):
    """Notify all users about an emergency alert."""
    tokens = list(UserPushToken.objects.filter(is_active=True).values_list('token', flat=True))
    if not tokens:
        return
    payload = {
        "type": "emergency_alert",
        "tokens": tokens,
        "title": "Emergency Alert!",
        "body": f"Emergency reported at {location}",
        "data": {"report_id": report_id, "location": location}
    }
    NotificationService().send_notification(payload)

def notify_volunteer_applied(application):
    """Notify NGO when a user applies to volunteer."""
    ngo = application.ngo
    tokens = list(UserPushToken.objects.filter(user=ngo.user, is_active=True).values_list('token', flat=True))
    if not tokens:
        return
    payload = {
        "type": "user_applied",
        "tokens": tokens,
        "title": "New Volunteer Application",
        "body": f"A new volunteer has applied to your NGO.",
        "data": {"application_id": application.id, "user_id": application.user.id}
    }
    NotificationService().send_notification(payload)

def notify_volunteer_accepted(application):
    """Notify user when their volunteer application is accepted."""
    user = application.user
    tokens = list(UserPushToken.objects.filter(user=user, is_active=True).values_list('token', flat=True))
    if not tokens:
        return
    payload = {
        "type": "ngo_accepted",
        "tokens": tokens,
        "title": "Application Accepted!",
        "body": f"Congratulations! Your volunteer application has been accepted.",
        "data": {"application_id": application.id, "ngo_id": application.ngo.id}
    }
    NotificationService().send_notification(payload)

def notify_injury_report_created(report):
    """Notify all NGOs and all users with volunteer status ON about a new injury report."""
    ngo_tokens = list(UserPushToken.objects.filter(user__in=NGO.objects.values_list('user', flat=True), is_active=True).values_list('token', flat=True))
    volunteer_tokens = list(UserPushToken.objects.filter(user__is_volunteer=True, is_active=True).values_list('token', flat=True))
    tokens = list(set(ngo_tokens + volunteer_tokens))
    if not tokens:
        return
    payload = {
        "type": "report_created",
        "tokens": tokens,
        "title": "New Injury Report",
        "body": f"A new injury report has been submitted.",
        "data": {"report_id": str(report.report_id)}
    }
    NotificationService().send_notification(payload)

# Existing function
def notify_report_assigned_to_ngo(report, ngo):
