import os
import json
import hashlib
from datetime import datetime

from appwrite.client import Client
from appwrite.services.databases import Databases


def get_event_data():
    raw = os.getenv('APPWRITE_FUNCTION_DATA')
    if raw:
        return json.loads(raw)
    # fallback to stdin
    try:
        import sys
        raw = sys.stdin.read()
        return json.loads(raw) if raw else {}
    except Exception:
        return {}


def upsert_device(token, platform, owner_id):
    endpoint = os.getenv('APPWRITE_ENDPOINT')
    project = os.getenv('APPWRITE_PROJECT')
    key = os.getenv('APPWRITE_API_KEY')
    database_id = os.getenv('APPWRITE_DATABASE_ID')
    devices_collection_id = os.getenv('APPWRITE_DEVICES_COLLECTION_ID')

    if not all([endpoint, project, key, database_id, devices_collection_id]):
        raise RuntimeError('Appwrite env vars not fully configured')

    client = Client()
    client.set_endpoint(endpoint).set_project(project).set_key(key)
    db = Databases(client)

    # deterministic doc id from token so we can upsert easily
    doc_id = hashlib.sha256(token.encode('utf-8')).hexdigest()
    data = {
        'ownerId': owner_id,
        'fcmToken': token,
        'platform': platform,
        'active': True,
        'lastSeen': datetime.utcnow().isoformat() + 'Z'
    }

    try:
        # try create - if exists, SDK will raise
        return db.create_document(database_id, devices_collection_id, doc_id, data)
    except Exception:
        try:
            # update existing
            return db.update_document(database_id, devices_collection_id, doc_id, data)
        except Exception as e:
            raise


def main():
    ev = get_event_data()
    token = ev.get('token') or ev.get('fcmToken')
    platform = ev.get('platform') or ev.get('os') or 'unknown'
    owner_id = ev.get('ownerId') or ev.get('userId')

    if not token or not owner_id:
        return {'error': 'missing token or ownerId'}

    try:
        doc = upsert_device(token, platform, owner_id)
        return {'ok': True, 'doc': doc}
    except Exception as e:
        return {'ok': False, 'error': str(e)}


if __name__ == '__main__':
    print(json.dumps(main()))
