import os
import json
import logging

logger = logging.getLogger('notifications')

_firebase_admin = None

def _init_firebase():
    global _firebase_admin
    if _firebase_admin:
        return _firebase_admin
    try:
        import firebase_admin
        from firebase_admin import credentials
        sa_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
        if sa_json:
            cred = credentials.Certificate(json.loads(sa_json))
            _firebase_admin = firebase_admin.initialize_app(cred)
        else:
            _firebase_admin = firebase_admin.initialize_app()
        return _firebase_admin
    except Exception as e:
        logger.exception('Failed to initialize firebase_admin: %s', e)
        raise

def subscribe_token_to_topic(token, topic):
    """Subscribe a single token to an FCM topic"""
    try:
        fa = _init_firebase()
        from firebase_admin import messaging
        res = messaging.subscribe_to_topic([token], topic)
        logger.info(f"Subscribed token to topic {topic}: {res.success_count} success")
        return res
    except Exception as e:
        logger.exception('subscribe_token_to_topic failed: %s', e)
        raise
