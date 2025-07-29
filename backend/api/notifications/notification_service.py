from appwrite.client import Client
from appwrite.services.messaging import Messaging
from appwrite.services.databases import Databases
from appwrite.input_file import InputFile
from appwrite.exception import AppwriteException
import os
import json
import time
from typing import Dict, List, Optional

class AppwriteNotificationService:
    def __init__(self):
        self.client = Client()
        self.client.set_endpoint(os.getenv("APPWRITE_ENDPOINT"))
        self.client.set_project(os.getenv("APPWRITE_PROJECT_ID"))
        self.client.set_key(os.getenv("APPWRITE_API_KEY"))
        
        self.messaging = Messaging(self.client)
        self.databases = Databases(self.client)

        #Topics Ids for different topics
        self.TOPICS ={
            'injury_reports': 'injury_reports',
            'volunteer_updates': 'volunteer_updates',
            'emergency_alerts': 'emergency-alerts',
            'general': 'general-notifications'
        }

    def create_notification_topics(self):
        """ Create topics for notifications if they don't exist """
        for topic_name, topic_id in self.TOPICS.items():
            try:
                self.messaging.create_topic(
                    topic_id=topic_id,
                    name=topic_name.replace("_", " ").title()
                )
            except AppwriteException as e:
                if getattr(e, 'code', None) != 409: # Topic already exists
                    print(f"Failed to create topic {topic_name}: {getattr(e, 'message', str(e))}")

    def send_push_notifications(
        self,
        topic: str,
        title: str,
        body: str,
        data: Dict[str, str] = None,
        user_ids: Optional[List[str]] = None
    ):
        """ send push notification to topic or specific users """
        try:
            message_data = {
                'title': title,
                'body': body,
                'data': data or {},
                'action': 'notification'
            }

            if user_ids:
                # send to specific users
                for user_id in user_ids:
                    try:
                        self.messaging.create_push(
                            message_id=f"msd_{user_id}_{int(time.time())}",
                            title=title,
                            body=body,
                            data=message_data,
                            user_id=[user_id]
                        )
                    except AppwriteException as e:
                        print(f"Failed to send push notification to user {user_id}: {e.message}")
            else:
                #Sent to topic
                topic_id = self.TOPICS.get(topic, self.TOPICS['general'])
                self.messaging.create_push(
                    message_id=f"msd_{topic_id}_{int(time.time())}",
                    title=title,
                    body=body,
                    data=message_data,
                    topic_id=topic_id
                )           

                # also store in the database for history
                self.store_notification_history(
                    title=title,
                    body=body,
                    data=data,
                    topic=topic,
                    user_ids=user_ids
                )

            return True
        except AppwriteException as e:
            print(f"Failed to send push notification: {e.message}")
            return False
    
    def subscribe_user_to_topic(
        self,
        user_id: str,
        topic: str,
        push_token: str
    ):
        """ Subscribe user to topics """
        try:
            topic_id = self.TOPICS.get(topic, self.TOPICS['general'])

            self.messaging.create_subscriber(
                topic_id=topic_id,
                subscriber_id=user_id,
                target_id=push_token
            )
            return True
        except AppwriteException as e:
            print(f"Failed to subscribe user to topic: {e.message}")
            return False

    def unsubscribe_user_from_topic(
        self,
        user_id: str,
        topic: str
    ):
        """ Unsubscribe user from the topic """
        try:
            topic_id = self.TOPICS.get(topic, self.TOPICS['general'])

            self.messaging.delete_subscriber(
                topic_id=topic_id,
                subscriber_id=user_id
            )
            return True
        except AppwriteException as e:
            print(f"Failed to unsubscribe user from topic: {e.message}")
            return False
    
    def store_notification_history(
        self,
        title: str,
        body: str,
        data: Dict,
        topic: str,
        user_ids: List[str] = None
    ):
        """ Store notification history in the database """
        from .models import NotificationHistory
        import uuid

        # If sent to specific users
        if user_ids:
            for user_id in user_ids:
                NotificationHistory.objects.create(
                    notification_id=str(uuid.uuid4()),
                    recipient_id=user_id,
                    recipient_type="user",
                    title=title,
                    body=body,
                    data=data,
                    status='sent',
                    is_read=False
                )
        else:
            # For topic notifications, we store the notification for all users
            # This would require additional logic to get all users subscribed to the topic
            pass
        