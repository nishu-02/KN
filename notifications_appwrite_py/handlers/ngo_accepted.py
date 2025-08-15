# Minimal NGO accepted handler
import os
import json
import asyncio
from src.adapters import queue_adapter

async def _run(event_data):
    doc = event_data.get('payload') or event_data
    application = {
        'id': doc.get('$id') or doc.get('id'),
        'userId': doc.get('userId'),
        'ngoId': doc.get('ngoId'),
        'status': doc.get('status')
    }
    if os.getenv('QUEUE_WEBHOOK_URL'):
        queue_adapter.push_job('handleNgoAccepted', {'application': application})
        return {'enqueued': True}
    return {'ok': True}


def main():
    raw = os.getenv('APPWRITE_FUNCTION_DATA')
    event_data = json.loads(raw) if raw else {}
    return asyncio.run(_run(event_data))

if __name__ == '__main__':
    print(main())
