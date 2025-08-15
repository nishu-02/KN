# Minimal Appwrite adapter (stubs). Replace database/collection ids and implement SDK queries.
import os

APPWRITE_ENDPOINT = os.getenv('APPWRITE_ENDPOINT')
APPWRITE_PROJECT = os.getenv('APPWRITE_PROJECT')
APPWRITE_API_KEY = os.getenv('APPWRITE_API_KEY')

# Using the appwrite SDK is recommended; here we keep stubs for portability.

async def exists_notification_by_idempotency(idempotency_key):
    # Query your notifications collection by idempotencyKey
    return False

async def query_ngos_by_bbox(box):
    # Query ngos collection for location.lat between min_lat..max_lat and location.lng between min_lng..max_lng
    return []

async def get_device_tokens_for_owners(owner_ids):
    # Query devices collection where ownerId in owner_ids and active==true, return list of tokens
    return []

async def create_notification_record(notification):
    # create document in notifications collection
    return {'id': 'stub-notif'}

async def update_notification_record_status(notification_id, patch):
    return True
