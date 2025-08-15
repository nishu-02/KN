import os
import json
import asyncio

firebase_admin = None
initialized = False

def init_firebase():
    global firebase_admin, initialized
    if initialized:
        return
    import firebase_admin as _fa
    from firebase_admin import credentials
    firebase_admin = _fa
    sa_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
    if sa_json:
        cred = credentials.Certificate(json.loads(sa_json))
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()
    initialized = True

async def send_to_device_batch(tokens, payload, options=None):
    init_firebase()
    if not tokens:
        return {'successCount': 0}
    from firebase_admin import messaging
    message = messaging.MulticastMessage(
        notification=messaging.Notification(title=payload.get('title'), body=payload.get('body')),
        tokens=tokens,
        data=options.get('data', {}) if options else {}
    )
    loop = asyncio.get_event_loop()
    res = await loop.run_in_executor(None, lambda: messaging.send_multicast(message))
    return res

async def send_to_topic(topic, payload, options=None):
    init_firebase()
    from firebase_admin import messaging
    message = messaging.Message(
        notification=messaging.Notification(title=payload.get('title'), body=payload.get('body')),
        topic=topic,
        data=options.get('data', {}) if options else {}
    )
    loop = asyncio.get_event_loop()
    res = await loop.run_in_executor(None, lambda: messaging.send(message))
    return res
