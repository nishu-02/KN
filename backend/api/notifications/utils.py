from .models import NotificationHistory

def send_push_notification(token, title, body, user_id=None, data=None):
    payload = {
        "to": token,
        "sound": "default",
        "title": title,
        "body": body,
        "data": data or {}
    }

    headers = {
        "Content-Type": "application/json"
    }

    # Send the push notification
    response = requests.post("https://exp.host/--/api/v2/push/send", json=payload, headers=headers)

    # Store it in DB if user_id provided
    if user_id:
        NotificationHistory.objects.create(
            user_id=user_id,
            title=title,
            body=body,
            data=data,
        )

    return response.json()