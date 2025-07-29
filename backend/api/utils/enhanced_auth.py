from appwrite.client import Client
from appwrite.services.account import Account
from django.conf import settings
from users.models import UserProfile
from ngo.models import NGO
import jwt
import datetime

def create_custom_jwt_with_account_type(email, password):
    """
    Create a custom JWT that includes account type information
    This eliminates the need for separate whoami calls
    """
    try:
        # 1. Authenticate with Appwrite first
        client = Client()
        client.set_endpoint(settings.APPWRITE_ENDPOINT)
        client.set_project(settings.APPWRITE_PROJECT_ID)
        
        account = Account(client)
        session = account.create_email_session(email, password)
        user_id = session['userId']
        
        # 2. Determine account type from database
        account_type = "unknown"
        entity_data = {}
        
        # Check if NGO
        try:
            ngo = NGO.objects.get(appwrite_user_id=user_id)
            account_type = "ngo"
            entity_data = {
                "entity_id": str(ngo.id),
                "name": ngo.name,
                "email": ngo.email,
                "verified": ngo.verified
            }
        except NGO.DoesNotExist:
            # Check if regular user
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
                pass
        
        # 3. Create custom JWT with account type
        payload = {
            'user_id': user_id,
            'account_type': account_type,
            'entity_data': entity_data,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
            'iat': datetime.datetime.utcnow(),
        }
        
        # Get original Appwrite JWT for API calls
        appwrite_jwt = account.create_jwt()
        
        # Create our custom JWT
        custom_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        
        return {
            "success": True,
            "custom_jwt": custom_token,
            "appwrite_jwt": appwrite_jwt['jwt'],
            "account_type": account_type,
            "entity_data": entity_data,
            "user_id": user_id
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def decode_custom_jwt(token):
    """
    Decode our custom JWT to get account type without DB calls
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return {
            "success": True,
            "user_id": payload['user_id'],
            "account_type": payload['account_type'],
            "entity_data": payload['entity_data']
        }
    except jwt.ExpiredSignatureError:
        return {"success": False, "error": "Token expired"}
    except jwt.InvalidTokenError:
        return {"success": False, "error": "Invalid token"}
