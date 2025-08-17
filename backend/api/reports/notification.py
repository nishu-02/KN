from .models import ExpoPushToken

def notify_user(user_id, title, body, data=None, report=None):
    try:
        send_and_log_notification(
            recipient_id=user_id,
            recipient_type="user",
            title=title,
            body=body,
            data=data,
            report=report
        )
    except ExpoPushToken.DoesNotExist:
        print(f"[Push] Token not found for user_id: {user_id}")