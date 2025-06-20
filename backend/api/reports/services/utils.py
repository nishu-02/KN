import requests

def send_push_notifications(token, title, body, data=None):
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
    response = requests.post("https://exp.host/--/api/v2/push/send", json=payload, headers=headers)
    return response.json()