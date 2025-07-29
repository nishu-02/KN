from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.services.databases import Databases
from appwrite.services.users import Users  # Updated: Imported for server-side verification
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


def verify_appwrite_jwt(jwt_token):
    """
    Verify Appwrite JWT token and return user data.
    Uses server-side API key for verification.
    
    Args:
        jwt_token (str): The JWT token to verify
        
    Returns:
        dict: {
            "success": bool,
            "user_data": dict or None,
            "error": str or None
        }
    """
    try:
        # Initialize Appwrite client with JWT
        client = Client()
        client.set_endpoint(settings.APPWRITE_ENDPOINT)
        client.set_project(settings.APPWRITE_PROJECT_ID)
        client.set_jwt(jwt_token)
        
        account = Account(client)
        
        # Get user data using JWT
        user_data = account.get()
        
        return {
            "success": True,
            "user_data": user_data,
            "error": None
        }
        
    except Exception as e:
        return {
            "success": False,
            "user_data": None,
            "error": str(e)
        }


# Updated: Added this function for server-side verification using Users service with API key
def verify_appwrite_user(appwrite_user_id: str, jwt_token: str = None) -> dict:
    """
    Server-side verification of Appwrite user using API key (via Users service).
    Optionally cross-verifies with provided JWT.
    Returns user data if valid.
    """
    try:
        # Check if API key is configured
        if not hasattr(settings, 'APPWRITE_API_KEY') or not settings.APPWRITE_API_KEY:
            raise ValueError("APPWRITE_API_KEY is not configured in settings")

        # Initialize Appwrite client with API key for server-side ops
        client = Client()
        client.set_endpoint(settings.APPWRITE_ENDPOINT)
        client.set_project(settings.APPWRITE_PROJECT_ID)
        client.set_key(settings.APPWRITE_API_KEY)  # Must be set for Users service

        users = Users(client)
        
        # Get user data via Users API (server-side, no session needed)
        user_data = users.get(appwrite_user_id)
        
        # Optional: If JWT is provided, cross-verify it matches
        if jwt_token:
            jwt_client = Client()
            jwt_client.set_endpoint(settings.APPWRITE_ENDPOINT)
            jwt_client.set_project(settings.APPWRITE_PROJECT_ID)
            jwt_client.set_jwt(jwt_token)
            
            account = Account(jwt_client)
            jwt_user = account.get()
            
            if jwt_user['$id'] != appwrite_user_id:
                raise ValueError("JWT user ID does not match provided appwrite_user_id")
        
        # Assuming user_logger is imported or available; log success
        if 'user_logger' in globals():
            user_logger.info(f"Appwrite user verified: {appwrite_user_id}")
        return {
            'verified': True,
            'user_data': user_data
        }
        
    except Exception as e:
        # Assuming user_logger is imported or available; log error
        if 'user_logger' in globals():
            user_logger.error(f"Appwrite user verification failed: {appwrite_user_id}, error: {str(e)}")
        return {
            'verified': False,
            'error': str(e)
        }


def create_appwrite_session_with_api_key(email, password):
    """
    DEPRECATED: This function is kept for backwards compatibility.
    Frontend now handles authentication directly with Appwrite SDK.
    """
    try:
        # Use server API key for session creation (for admin operations only)
        client = Client()
        client.set_endpoint(settings.APPWRITE_ENDPOINT)
        client.set_project(settings.APPWRITE_PROJECT_ID)
        client.set_key(settings.APPWRITE_API_KEY)


        account = Account(client)
        
        # Create session using email/password
        session = account.create_email_session(email, password)
        
        # Set session to get user data
        client.set_session(session['secret'])
        
        # Get user data
        user_data = account.get()
        
        # Create JWT for client use
        jwt_response = account.create_jwt()
        appwrite_jwt = jwt_response['jwt']
        
        # Determine account type from Django
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
        print(f"Authentication error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }