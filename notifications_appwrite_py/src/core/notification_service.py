from .geo import bounding_box, haversine_km

async def handle_report_created(report, adapters, options=None):
    options = options or {}
    idempotency_key = f"report:{report.get('id')}"
    exists = await adapters['appwrite'].exists_notification_by_idempotency(idempotency_key)
    if exists:
        return {'skipped': True}

    box = bounding_box(report['lat'], report['lng'], 5)
    candidates = await adapters['appwrite'].query_ngos_by_bbox(box)
    ngos_within = [n for n in candidates if haversine_km(report['lat'], report['lng'], n['location']['lat'], n['location']['lng']) <= 5]
    ngo_ids = [n.get('$id') or n.get('id') for n in ngos_within]

    ngo_tokens = await adapters['appwrite'].get_device_tokens_for_owners(ngo_ids)

    notification = {
        'idempotencyKey': idempotency_key,
        'category': 'report_created',
        'target': {'type': 'geo', 'center': {'lat': report['lat'], 'lng': report['lng']}, 'radiusKm': 5},
        'payload': {'title': report.get('title', 'New report'), 'body': report.get('message', '')},
        'status': 'pending'
    }
    notif_doc = await adapters['appwrite'].create_notification_record(notification)

    # send in batches
    sent = 0
    batch_size = 500
    for i in range(0, len(ngo_tokens), batch_size):
        batch = ngo_tokens[i:i+batch_size]
        res = await adapters['fcm'].send_to_device_batch(batch, notification['payload'], {'data': {'reportId': report.get('id')}})
        if hasattr(res, 'success_count'):
            sent += res.success_count
        elif isinstance(res, dict) and res.get('successCount'):
            sent += res.get('successCount')

    volunteer_res = None
    try:
        volunteer_res = await adapters['fcm'].send_to_topic('volunteer', notification['payload'], {'data': {'reportId': report.get('id')}})
    except Exception:
        volunteer_res = None

    await adapters['appwrite'].update_notification_record_status(notif_doc.get('$id') or notif_doc.get('id'), {'status': 'sent', 'sentToCount': sent})
    return {'sentTo': sent, 'volunteer': bool(volunteer_res)}
