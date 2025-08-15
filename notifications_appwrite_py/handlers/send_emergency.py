# Minimal emergency handler
import os
import json
import asyncio
from src.adapters import queue_adapter

async def _run(event_data):
    payload = event_data.get('payload') or event_data
    if os.getenv('QUEUE_WEBHOOK_URL'):
        queue_adapter.push_job('sendEmergency', payload)
        return {'enqueued': True}
    return {'ok': True}


def main():
    raw = os.getenv('APPWRITE_FUNCTION_DATA')
    event_data = json.loads(raw) if raw else {}
    return asyncio.run(_run(event_data))

if __name__ == '__main__':
    print(main())
