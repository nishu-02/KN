from rest_framework.permissions import BasePermission
from appwrite.client import Client
from appwrite.services.account import Account
from django.conf import settings

class IsAppwriteUser(BasePermission):
    def has_permission(self, request, view):

        # Checking if the user is present in the Appewrite database or not
        token = request.headers.get('Authorization')
        if not token or token.startswith('Bearer '):
            return False
        
        jwt = token.split('Bearer ')[-1]
        # Getting the token from the headers

        try:
            client = Client()
            client.set_endpoint(settings.APPWRITE_ENDPOINT)
            client.set_project(settings.APPWRITE_PROJECT_ID)
            client.set_jwt(jwt)

            account = Account(client)
            user = account.get()

            request.user_id = user["$id"] #Inject into request
            return True
        except Exception:
            return False