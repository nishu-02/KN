from .models import ExpoPushToken
from .services.utils import send_push_notification

def notify_user(user_id, title, body, data=None):
    try:
        token_obj = ExpoPushToken.objects.get(user_id=user_id)
        send_push_notification(token_obj.token, title, body, data)
    except ExpoPushToken.DoesNotExist:
        print(f"[Push] Token not found for user_id: {user_id}")