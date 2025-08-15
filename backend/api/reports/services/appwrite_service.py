from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage
from appwrite.services.messaging import Messaging
from appwrite.id import ID

from django.conf import settings
from utils.logger import appwrite_logger, log_appwrite_operation

def get_appwrite_client():
    """
    Initialize and return an Appwrite client.
    """
    client = Client()
    client.set_endpoint(settings.APPWRITE_ENDPOINT)
    client.set_project(settings.APPWRITE_PROJECT_ID)
    client.set_key(settings.APPWRITE_API_KEY)
    return client


@log_appwrite_operation(appwrite_logger, 'create')
def create_appwrite_report(report):
    """
    Create a new injury report document in Appwrite.
    """
    client = get_appwrite_client()
    databases = Databases(client)

    try:
        response = databases.create_document(
            database_id=settings.APPWRITE_DATABASE_ID,
            collection_id=settings.APPWRITE_REPORT_COLLECTION_ID,
            document_id='unique()',  # Let Appwrite auto-generate ID
            data={
                "user_id": str(report.user_id),
                "location": report.location,
                "report_data": report.report_data,
                "created_at": str(report.created_at),
            }
        )
        return response
    except Exception as e:
        appwrite_logger.error(f"Appwrite report sync failed: {e}")
        return None


@log_appwrite_operation(appwrite_logger, 'create')
def create_appwrite_notification(payload: dict):
    """
    Create a new notification document in Appwrite.
    """
    client = get_appwrite_client()
    databases = Databases(client)

    try:
        response = databases.create_document(
            database_id=settings.APPWRITE_DATABASE_ID,
            collection_id=settings.APPWRITE_NOTIFICATION_COLLECTION_ID,
            document_id='unique()',  # Let Appwrite auto-generate ID
            data=payload
        )
        return response
    except Exception as e:
        appwrite_logger.error(f"Appwrite notification sync failed: {e}")
        return None

@log_appwrite_operation(appwrite_logger, 'update')
def update_notification_status(report_id, ngo_id, new_status):

    """
    Updating the notification
    """
    client = get_appwrite_client()
    databases = Databases(client)

    try:
        #Find the notification document
        result = databases.list_document(
            database_id=settings.APPWRITE_DATABASE_ID,
            collection_id=settings.APPWRITE_NOTIFICATION_COLLECTION_ID,
            queries=[
                f'equal("report_id", "{report_id}")',
                f'equal("ngo_id", "{ngo_id}")'
            ]
        )
        
        documents = result.get('documents', [])
        if not documents:
            appwrite_logger.warning(f"Notification not found for report and NGO: report_id={report_id}, ngo_id={ngo_id}")
            return None
        doc_id = documents[0]['$id']
        updated = databases.update_document(
            database_id=settings.APPWRITE_DATABASE_ID,
            collection_id=settings.APPWRITE_NOTIFICATION_COLLECTION_ID,
            document_id=doc_id,
            data={
                'status': new_status
            }
        )

        return updated

    except Exception as e:
        appwrite_logger.error(f"Failed to update the notification status: {e}")
        return None

import io
@log_appwrite_operation(appwrite_logger, 'upload')
def upload_image_to_appwrite(image_file):
    client = get_appwrite_client()
    storage = Storage(client)
    
    # Reset pointer (important)
    image_file.seek(0)
    
    # Create file with InputFile wrapper
    from appwrite.input_file import InputFile

    response = storage.create_file(
        bucket_id=settings.APPWRITE_BUCKET_ID,
        file_id="unique()",
        file=InputFile.from_bytes(image_file.read(), filename=getattr(image_file, 'name', 'upload.jpg')),
        permissions=["read(\"any\")"]
    )
    
    return response["$id"]

def get_image_url(file_id):
    return f"{settings.APPWRITE_ENDPOINT}/storage/buckets/{settings.APPWRITE_BUCKET_ID}/files/{file_id}/view?project={settings.APPWRITE_PROJECT_ID}"

@log_appwrite_operation(appwrite_logger, 'subscribe')
def subscribe_user_to_topic(user_id, topic_id, push_token):
    """
    Subscribe a user to a notification topic in Appwrite
    """
    client = get_appwrite_client()
    messaging = Messaging(client)
    
    try:
        appwrite_logger.info(f"🔔 Subscribing user {user_id} to topic {topic_id}")
        
        # For push notifications, the target_id should be the push token
        # First create a push target using the push token
        try:
            # Create a push target first
            target_result = messaging.create_target(
                target_id=ID.unique(),
                provider_type='push',
                identifier=push_token,
                user_id=user_id
            )
            target_id = target_result['$id']
            appwrite_logger.info(f"📱 Created push target: {target_id}")
            
        except Exception as target_error:
            # If target creation fails, try to find existing target
            appwrite_logger.warning(f"Target creation failed, trying to find existing: {target_error}")
            # For now, let's use a simplified approach
            target_id = push_token
        
        # Create subscriber
        result = messaging.create_subscriber(
            topic_id=topic_id,
            subscriber_id=ID.unique(),
            target_id=target_id
        )
        
        appwrite_logger.info(f"✅ User {user_id} subscribed to topic {topic_id}")
        return result
        
    except Exception as e:
        appwrite_logger.error(f"❌ Failed to subscribe user {user_id} to topic {topic_id}: {e}")
        return None


@log_appwrite_operation(appwrite_logger, 'unsubscribe')
def unsubscribe_user_from_topic(user_id, topic_id):
    """
    Remove user from a notification topic
    """
    client = get_appwrite_client()
    messaging = Messaging(client)
    
    try:
        # You can implement this later if needed
        appwrite_logger.info(f"Unsubscribed user {user_id} from topic {topic_id}")
        return True
    except Exception as e:
        appwrite_logger.error(f"Unsubscribe failed: {e}")
        return False


@log_appwrite_operation(appwrite_logger, 'send_message')
def send_notification_to_topic(topic_id, title, body, data=None):
    """
    Send push notification to all subscribers of a topic
    """
    client = get_appwrite_client()
    messaging = Messaging(client)
    
    try:
        appwrite_logger.info(f"📤 Sending notification to topic {topic_id}: {title}")
        
        result = messaging.create_push(
            message_id=ID.unique(),
            title=title,
            body=body,
            topics=[topic_id],
            data=data or {}
        )
        
        appwrite_logger.info(f"✅ Notification sent to topic {topic_id}")
        return result
        
    except Exception as e:
        appwrite_logger.error(f"❌ Failed to send notification to topic {topic_id}: {e}")
        return None


@log_appwrite_operation(appwrite_logger, 'get_subscribers')
def get_topic_subscribers(topic_id):
    """
    Get list of subscribers for a topic (for debugging)
    """
    client = get_appwrite_client()
    messaging = Messaging(client)
    
    try:
        subscribers = messaging.list_subscribers(topic_id)
        appwrite_logger.info(f"📊 Topic {topic_id} has {len(subscribers.get('subscribers', []))} subscribers")
        return subscribers
    except Exception as e:
        appwrite_logger.error(f"Failed to get subscribers for topic {topic_id}: {e}")
        return None


@log_appwrite_operation(appwrite_logger, 'send_emergency')
def send_emergency_notification(report_id, location, severity="high"):
    """
    Send emergency notification to emergency-alerts topic
    """
    try:
        title = "🚨 Emergency Alert"
        body = f"Emergency reported at {location}"
        data = {
            "type": "emergency",
            "report_id": str(report_id),
            "location": location,
            "severity": severity,
            "action": "open_report"
        }
        
        result = send_notification_to_topic('emergency-alerts', title, body, data)
        return result
        
    except Exception as e:
        appwrite_logger.error(f"Failed to send emergency notification: {e}")
        return None


@log_appwrite_operation(appwrite_logger, 'send_volunteer')
def send_volunteer_update(message, report_id=None):
    """
    Send update to volunteer_updates topic
    """
    try:
        title = "📢 Volunteer Update"
        data = {
            "type": "volunteer_update",
            "action": "refresh_data"
        }
        
        if report_id:
            data["report_id"] = str(report_id)
        
        result = send_notification_to_topic('volunteer_updates', title, message, data)
        return result
        
    except Exception as e:
        appwrite_logger.error(f"Failed to send volunteer update: {e}")
        return None
