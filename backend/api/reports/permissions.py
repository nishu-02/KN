# from rest_framework.permissions import BasePermission
# from appwrite.client import Client
# from appwrite.services.account import Account
# from django.conf import settings

# class IsAppwriteUser(BasePermission):
#     def has_permission(self, request, view):
#         token = request.headers.get('Authorization')
#         print(f"TOKEN HEADER: {token}")

#         if not token:
#             print("No token found")
#             return False

#         if token.startswith("Bearer "):
#             token = token.replace("Bearer ", "")

#         try:
#             client = Client()
#             client.set_endpoint(settings.APPWRITE_ENDPOINT)
#             client.set_project(settings.APPWRITE_PROJECT_ID)
#             client.set_jwt(token)

#             account = Account(client)
#             user = account.get()

#             print(f"USER AUTH SUCCESS: {user}")
#             request.user_id = user["$id"]
#             return True
#         except Exception as e:
#             print(f"APPWRITE AUTH ERROR: {e}")
#             return False
from rest_framework.permissions import BasePermission

class IsAppwriteUser(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request, "user_id")
