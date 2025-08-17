

import os
import requests
import logging
from django.utils import timezone
from notifications.models import Notification

logger = logging.getLogger('notifications')

class NotificationService:
    def __init__(self):
        self.onesignal_app_id = os.environ.get('ONESIGNAL_APP_ID')
        self.onesignal_api_key = os.environ.get('ONESIGNAL_REST_API_KEY')
        self.onesignal_url = "https://onesignal.com/api/v1/notifications"

    def send_notification(self, payload: dict) -> dict:
        title = payload.get('title', 'Karuna Nidhan')
        body = payload.get('body', '')
        data = payload.get('data', {})
        notification_type = payload.get('type', 'general')
        recipient_user_id = payload.get('recipient_user_id')

        onesignal_payload = {
            "app_id": self.onesignal_app_id,
            "headings": {"en": title},
            "contents": {"en": body},
            "data": data,
            "included_segments": ["All"]
        }

        headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": f"Basic {self.onesignal_api_key}"
        }

        try:
            response = requests.post(self.onesignal_url, json=onesignal_payload, headers=headers, timeout=10)
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"OneSignal notification sent: {result}")
            
            if recipient_user_id:
                try:
                    Notification.objects.create(
                        recipient_user_id=recipient_user_id,
                        type=notification_type,
                        title=title,
                        body=body,
                        data=data,
                        sent_at=timezone.now()
                    )
                except Exception as e:
                    logger.error(f"Failed to store notification: {e}")

            return {"onesignal": result, "success": True}
            
        except Exception as e:
            logger.error(f"OneSignal notification failed: {e}")
            return {"onesignal": {"error": str(e)}, "success": False}
