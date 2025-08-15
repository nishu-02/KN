import os
import requests
import json

def push_job(name, payload):
    url = os.getenv('QUEUE_WEBHOOK_URL')
    if not url:
        return {'enqueued': False, 'reason': 'no queue webhook configured'}
    res = requests.post(url, json={'name': name, 'payload': payload}, timeout=10)
    if not res.ok:
        raise Exception(f'Failed to enqueue job: {res.status_code} {res.text}')
    return {'enqueued': True}
