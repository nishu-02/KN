from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from appwrite.client import Client
from appwrite.services.account import Account
from django.conf import settings

class AppwriteJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        token = auth_header.replace("Bearer ", "").strip()

        try:
            # Appwrite client setup
            client = Client()
            client.set_endpoint(settings.APPWRITE_ENDPOINT)
            client.set_project(settings.APPWRITE_PROJECT_ID)
            client.set_jwt(token)

            account = Account(client)
            appwrite_user = account.get()

            # Store Appwrite user ID in request
            request.user_id = appwrite_user["$id"]
            request.user_email = appwrite_user.get("email", None)
            request.user = appwrite_user  # optionally assign raw user dict

            return (None, token)  # No Django user, token still valid

        except Exception as e:
            raise AuthenticationFailed(f"Invalid Appwrite token: {e}")
