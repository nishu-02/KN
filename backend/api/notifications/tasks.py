
from celery import shared_task
from utils.logger import notifications_logger
from .notification_service import AppwriteNotificationService
from .utils import send_and_log_notification


# Async task for send_and_log_notification
@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_and_log_notification_task(self, recipient_id, recipient_type, title, body, data=None, report_id=None):
    """
    Celery task to send and log notification asynchronously.
    """
    try:
        notifications_logger.info(
            f"Executing send_and_log_notification_task for recipient: {recipient_id}",
            extra={'recipient_id': recipient_id, 'title': title}
        )
        # Import here to avoid circular import
        from reports.models import InjuryReport
        report = None
        if report_id:
            try:
                report = InjuryReport.objects.get(report_id=report_id)
            except Exception:
                report = None
        send_and_log_notification(
            recipient_id=recipient_id,
            recipient_type=recipient_type,
            title=title,
            body=body,
            data=data,
            report=report
        )
    except Exception as exc:
        notifications_logger.error(f"Error in send_and_log_notification_task: {exc}. Retrying...")
        raise self.retry(exc=exc)

# Async task for Appwrite push notifications
@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_appwrite_push_task(self, topic, title, body, data=None, user_ids=None):
    try:
        notifications_logger.info(
            f"Executing send_appwrite_push_task for topic: {topic}, users: {user_ids}",
            extra={'topic': topic, 'title': title}
        )
        service = AppwriteNotificationService()
        service.send_push_notifications(
            topic=topic,
            title=title,
            body=body,
            data=data,
            user_ids=user_ids
        )
    except Exception as exc:
        notifications_logger.error(f"Error in send_appwrite_push_task: {exc}. Retrying...")
        raise self.retry(exc=exc)