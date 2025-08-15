import os
import json
import asyncio
from src.core.notification_service import handle_report_created
from src.adapters import appwrite_adapter, fcm_adapter, queue_adapter

async def _run(event_data):
    # normalize payload
    doc = event_data.get('payload') or event_data
    report = {
        'id': doc.get('$id') or doc.get('id') or doc.get('reportId'),
        'lat': doc.get('location', {}).get('lat') or doc.get('lat'),
        'lng': doc.get('location', {}).get('lng') or doc.get('lng'),
        'title': doc.get('title') or doc.get('summary'),
        'message': doc.get('message') or doc.get('body')
    }

    if os.getenv('QUEUE_WEBHOOK_URL'):
        queue_adapter.push_job('handleReportCreated', {'report': report})
        return {'enqueued': True}

    adapters = {'appwrite': appwrite_adapter, 'fcm': fcm_adapter}
    res = await handle_report_created(report, adapters)
    return res

def main():
    # Appwrite provides event data in APPWRITE_FUNCTION_DATA
    raw = os.getenv('APPWRITE_FUNCTION_DATA')
    if raw:
        event_data = json.loads(raw)
    else:
        # try reading sample from stdin
        try:
            import sys
            raw_stdin = sys.stdin.read()
            event_data = json.loads(raw_stdin) if raw_stdin else {}
        except Exception:
            event_data = {}

    return asyncio.run(_run(event_data))

if __name__ == '__main__':
    print(main())
