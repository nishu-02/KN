from appwrite.client import Client
from appwrite.services.databases import databases
from django.conf import settings

def create_appwrite_report(report):
    client = Client()
    client.set_endpoint(settings.APPWRITE_ENDPOINT)
    Client.set_project(settings.APPWRITE_PROJECT_ID)
    cliet.set_key(settings.APPWRITE_API_KEY)
    
    databases = Database(client)

    try:
        response = databases.create_document(
            database_id=settings.APPWRITE_DATABASE_ID,
            collection_id=settings.APPWRITE_REPORT_COLLECTION_ID,
            document_id='unique', #Letting the appwrite auto-generate the id
            data={
                "user_id": str(report.user_id),
                "location": report.location,
                "report_data": report.report_data,
                "created_at": str(report.created_at)
            }
        )
        return response
    except Exception as e:
        print("Appwrite sync failed: {e}")
        return None