import requests
from django.conf import settings

class NotificationService:
    """
    Service to send push notifications via Appwrite Function.
    """
    def __init__(self):
        self.function_endpoint = settings.APPWRITE_FUNCTION_ENDPOINT  # e.g. https://cloud.appwrite.io/v1/functions/<function_id>/executions
        self.api_key = settings.APPWRITE_API_KEY  # Appwrite API Key with function execution permission

    def send_notification(self, payload: dict) -> dict:
        headers = {
            "X-Appwrite-Project": settings.APPWRITE_PROJECT_ID,
            "X-Appwrite-Key": self.api_key,
            "Content-Type": "application/json",
        }
        response = requests.post(self.function_endpoint, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
