import requests
from .models import NotificationHistory
from reports.models import ExpoPushToken
from utils.logger import notifications_logger, log_notification_sent

def send_and_log_notification(recipient_id, recipient_type, title, body, data=None, report=None):
    """
    Send a push notification (if ExpoPushToken exists) and log it in NotificationHistory.
    """
    token_obj = ExpoPushToken.objects.filter(user_id=recipient_id).first()
    notification_sent = False
    
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
            response = requests.post("https://exp.host/--/api/v2/push/send", json=payload, headers=headers)
            notification_sent = response.status_code == 200
            if not notification_sent:
                notifications_logger.warning(f"Push notification failed with status {response.status_code}")
        except Exception as e:
            notifications_logger.error(f"Error sending push notification: {e}")
    else:
        notifications_logger.info(f"No push token found for user: {recipient_id}")
    
    # Log notification attempt
    log_notification_sent(
        notification_type=f"push_{recipient_type}",
        recipient_id=recipient_id,
        success=notification_sent,
        details={
            'title': title,
            'body': body,
            'data': data,
            'report_id': str(report.report_id) if report else None
        }
    )
    
    NotificationHistory.objects.create(
        report=report,
        recipient_id=recipient_id,
        recipient_type=recipient_type,
        title=title,
        body=body,
        data=data,
        status='sent' if notification_sent else 'failed',
    )