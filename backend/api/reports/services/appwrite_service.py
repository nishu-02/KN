from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage

from django.conf import settings

def get_appwrite_client():
    """
    Initialize and return an Appwrite client.
    """
    client = Client()
    client.set_endpoint(settings.APPWRITE_ENDPOINT)
    client.set_project(settings.APPWRITE_PROJECT_ID)
    client.set_key(settings.APPWRITE_API_KEY)
    return client


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
        print(f"Appwrite report sync failed: {e}")
        return None


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
        print(f"Appwrite notification sync failed: {e}")
        return None

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
            print("Notification not found for report and NGO")
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
        print(f"[Appwrite] Failed to update the notification status: {e}")
        return None

import io
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
    return f"{settings.APPWRITE_ENDPOINT}/v1/storage/buckets/{settings.APPWRITE_BUCKET_ID}/files/{file_id}/view?project={settings.APPWRITE_PROJECT_ID}"
