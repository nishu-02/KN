from celery import shared_task
from .production_notification_service import notification_service, send_notification_async


@shared_task(bind=True)
def send_appwrite_push_task(self, topic: str, title: str, body: str, data: dict = None, user_ids: list = None):
    """
    Backwards-compatible Celery task wrapper.
    Older callers may enqueue `notifications.tasks.send_appwrite_push_task`.
    Delegate to the new notification service implementation.
    """
    # Normalize args - older messages may pass a single dict as kwargs
    try:
        # If called with kwargs as a single dict in args, attempt to extract
        if not data and isinstance(title, dict):
            payload = title
            title = payload.get('title')
            body = payload.get('body')
            data = payload.get('data')
            user_ids = payload.get('user_ids')

        # Use production notification service to send announcement
        # For compatibility we send as a general announcement
        notification_service.send_general_announcement(title=title, body=body, user_ids=user_ids)
    except Exception as exc:
        # Re-raise so Celery can record retry if configured
        raise
