from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.services.databases import Databases
from django.conf import settings
from users.models import UserProfile
from ngo.models import NGO

def get_account_type_from_appwrite_user(user_data):
    """
    Determine account type using Appwrite user data + minimal DB lookup
    This approach uses Appwrite as the source of truth
    """
    try:
        user_id = user_data['$id']
        email = user_data.get('email', '')
        
        # Quick check in Django DB to determine account type
        # This is just for account type detection, not authentication
        account_type = "unknown"
        entity_data = {}
        
        # Check if NGO exists
        try:
            ngo = NGO.objects.get(appwrite_user_id=user_id)
            account_type = "ngo"
            entity_data = {
                "entity_id": str(ngo.id),
                "name": ngo.name,
                "email": ngo.email,
                "verified": ngo.verified,
                "category": ngo.category
            }
        except NGO.DoesNotExist:
            # Check if regular user exists
            try:
                user_profile = UserProfile.objects.get(appwrite_user_id=user_id)
                account_type = "user"
                entity_data = {
                    "entity_id": str(user_profile.id),
                    "name": user_profile.name,
                    "email": user_profile.email,
                    "is_volunteer": user_profile.is_volunteer
                }
            except UserProfile.DoesNotExist:
                # User authenticated in Appwrite but no profile in Django
                # This is valid for new users who just signed up
                account_type = "new_user"
                entity_data = {
                    "name": user_data.get('name', ''),
                    "email": email
                }
        
        return {
            "success": True,
            "account_type": account_type,
            "entity_data": entity_data,
            "appwrite_user": user_data
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def appwrite_login_with_account_detection(email, password):
    """
    Appwrite-first login that also detects account type
    Appwrite handles authentication, Django only provides account type
    """
    try:
        # 1. Authenticate with Appwrite (primary authentication)
        client = Client()
        client.set_endpoint(settings.APPWRITE_ENDPOINT)
        client.set_project(settings.APPWRITE_PROJECT_ID)
        
        account = Account(client)
        
        # Create session with Appwrite
        session = account.create_email_session(email, password)
        
        # Get Appwrite user data
        user_data = account.get()
        
        # Get JWT from Appwrite
        jwt_response = account.create_jwt()
        appwrite_jwt = jwt_response['jwt']
        
        # 2. Determine account type from Django (minimal DB lookup)
        account_info = get_account_type_from_appwrite_user(user_data)
        
        if not account_info["success"]:
            return {
                "success": False,
                "error": f"Failed to determine account type: {account_info['error']}"
            }
        
        return {
            "success": True,
            "appwrite_jwt": appwrite_jwt,
            "appwrite_session": session,
            "appwrite_user": user_data,
            "account_type": account_info["account_type"],
            "entity_data": account_info["entity_data"],
            "user_id": user_data['$id']
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
