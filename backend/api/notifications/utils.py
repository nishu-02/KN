import requests
from .models import NotificationHistory
from reports.models import ExpoPushToken

def send_and_log_notification(recipient_id, recipient_type, title, body, data=None, report=None):
    """
    Send a push notification (if ExpoPushToken exists) and log it in NotificationHistory.
    """
    token_obj = ExpoPushToken.objects.filter(user_id=recipient_id).first()
    if token_obj:
        payload = {
            "to": token_obj.token,
            "sound": "default",
            "title": title,
            "body": body,
            "data": data or {}
        }
        headers = {"Content-Type": "application/json"}
        try:
            requests.post("https://exp.host/--/api/v2/push/send", json=payload, headers=headers)
        except Exception as e:
            print(f"[Push] Error sending notification: {e}")
    NotificationHistory.objects.create(
        report=report,
        recipient_id=recipient_id,
        recipient_type=recipient_type,
        title=title,
        body=body,
        data=data,
        status='sent',
    )