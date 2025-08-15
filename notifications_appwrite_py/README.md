Python Appwrite Functions scaffold for notifications

Structure
- src/core: pure logic (geo, idempotency, notification service)
- src/adapters: Appwrite/FCM/queue adapters
- handlers: Appwrite Function entrypoints (thin glue)
- tests: unit tests for core logic

How to deploy
- Use Appwrite Console to create a Python 3.10 function and set the entrypoint to the handler you want (e.g., `handlers/report_created.py`).
- Set env vars in Console: APPWRITE_ENDPOINT, APPWRITE_PROJECT, APPWRITE_API_KEY, FIREBASE_SERVICE_ACCOUNT_JSON, QUEUE_WEBHOOK_URL(optional)

Local tests
- Create a virtualenv, install dependencies, run pytest

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
```

Portability
- Core logic is adapter-agnostic. Swap adapters to migrate away from Appwrite.
