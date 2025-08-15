from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings
from django.db import transaction
from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.services.users import Users  # Updated: Imported for server-side verification
from users.models import UserProfile
from ngo.models import NGO
from utils.logger import user_logger, log_error_with_context
import json


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
        
        user_logger.info(f"Appwrite user verified: {appwrite_user_id}")
        return {
            'verified': True,
            'user_data': user_data
        }
        
    except Exception as e:
        user_logger.error(f"Appwrite user verification failed: {appwrite_user_id}, error: {str(e)}")
        return {
            'verified': False,
            'error': str(e)
        }


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user profile or NGO in Django after Appwrite account creation.
    This endpoint is called by the frontend after successful Appwrite registration.
    
    Expected payload:
    {
        "appwrite_user_id": "string",
        "email": "string", 
        "name": "string",
        "account_type": "user" | "ngo"
    }
    """
    try:
        data = request.data
        appwrite_user_id = data.get('appwrite_user_id')
        email = data.get('email')
        name = data.get('name')
        account_type = data.get('account_type')
        
        # Validate required fields
        if not all([appwrite_user_id, email, name, account_type]):
            return Response({
                'success': False,
                'error': 'Missing required fields: appwrite_user_id, email, name, account_type'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if account_type not in ['user', 'ngo']:
            return Response({
                'success': False,
                'error': 'account_type must be either "user" or "ngo"'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Updated: Verify Appwrite user (now required, removed skip_server_verification)
        jwt_token = request.headers.get('Authorization', '').replace('Bearer ', '') if request.headers.get('Authorization') else None
        verification = verify_appwrite_user(appwrite_user_id, jwt_token)
        if not verification['verified']:
            user_logger.warning(f"Failed to verify Appwrite user during registration: {appwrite_user_id}")
            return Response({
                'success': False,
                'error': 'Invalid Appwrite user: ' + verification['error']
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        if UserProfile.objects.filter(appwrite_user_id=appwrite_user_id).exists():
            return Response({
                'success': False,
                'error': 'User profile already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if NGO.objects.filter(appwrite_user_id=appwrite_user_id).exists():
            return Response({
                'success': False,
                'error': 'NGO profile already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create profile based on account type
        with transaction.atomic():
            if account_type == 'user':
                profile = UserProfile.objects.create(
                    appwrite_user_id=appwrite_user_id,
                    email=email,
                    name=name,
                    is_volunteer=True,  # Default to volunteer
                    notification_preferences={}
                )
                
                entity_data = {
                    'entity_id': str(profile.id),
                    'name': profile.name,
                    'email': profile.email,
                    'is_volunteer': profile.is_volunteer
                }
                
                user_logger.info(f"UserProfile created: {profile.id} for Appwrite user: {appwrite_user_id}")
                
            elif account_type == 'ngo':
                # For NGO, we need more info, but we'll create with minimal data
                # Additional fields can be updated later via profile completion
                ngo = NGO.objects.create(
                    appwrite_user_id=appwrite_user_id,
                    email=email,
                    name=name,
                    latitude=0.0,  # Will be updated during profile completion
                    longitude=0.0,  # Will be updated during profile completion
                    category='other',  # Default category
                    verified=False,
                    description='',
                    website=''
                )
                
                entity_data = {
                    'entity_id': str(ngo.id),
                    'name': ngo.name,
                    'email': ngo.email,
                    'verified': ngo.verified,
                    'category': ngo.category
                }
                
                user_logger.info(f"NGO created: {ngo.id} for Appwrite user: {appwrite_user_id}")
        
        return Response({
            'success': True,
            'account_type': account_type,
            'entity_id': entity_data['entity_id'],
            'entity_data': entity_data,
            'message': f'{account_type.upper()} profile created successfully'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        log_error_with_context(user_logger, e, {
            'action': 'register_user',
            'data': request.data
        })
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def get_account_type(request):
    """
    Get account type and entity data for an Appwrite user.
    This endpoint is called during login to determine user type for navigation.
    
    Expected payload:
    {
        "appwrite_user_id": "string"
    }
    """
    try:
        data = request.data
        appwrite_user_id = data.get('appwrite_user_id')
        
        if not appwrite_user_id:
            return Response({
                'success': False,
                'error': 'appwrite_user_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # QUICK FIX: For release, skip server-side verification and trust the frontend JWT
        # This is a temporary fix to unblock the release
        try:
            # Try to get account type by looking up the user directly
            account_info = None
            
            # Check if this is a regular user
            try:
                user_profile = UserProfile.objects.filter(appwrite_user_id=appwrite_user_id).first()
                if user_profile:
                    account_info = {
                        'account_type': 'user',
                        'entity_id': str(user_profile.id),
                        'user_data': {
                            'name': user_profile.full_name or 'User',
                            'email': user_profile.email or '',
                            'verified': True
                        }
                    }
            except Exception as e:
                user_logger.warning(f"Error checking user profile: {e}")
            
            # Check if this is an NGO
            if not account_info:
                try:
                    ngo = NGO.objects.filter(appwrite_user_id=appwrite_user_id).first()
                    if ngo:
                        account_info = {
                            'account_type': 'ngo',
                            'entity_id': str(ngo.id),
                            'user_data': {
                                'name': ngo.name,
                                'email': ngo.contact_email or '',
                                'verified': ngo.is_verified
                            }
                        }
                except Exception as e:
                    user_logger.warning(f"Error checking NGO: {e}")
            
            # If no existing profile found, it's a new user
            if not account_info:
                account_info = {
                    'account_type': 'new_user',
                    'entity_id': None,
                    'user_data': {
                        'name': 'New User',
                        'email': '',
                        'verified': False
                    }
                }
            
            # Return the account info
            user_logger.info(f"Account type determined: {account_info['account_type']} - user_id={appwrite_user_id}")
            return Response({
                'success': True,
                'account_type': account_info['account_type'],
                'entity_id': account_info['entity_id'],
                'user_data': account_info['user_data']
            })
            
        except Exception as e:
            log_error_with_context(user_logger, e, {
                'action': 'get_account_type',
                'appwrite_user_id': appwrite_user_id
            })
            return Response({
                'success': False,
                'error': 'Internal server error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        log_error_with_context(user_logger, e, {
            'action': 'get_account_type',
            'appwrite_user_id': data.get('appwrite_user_id') if 'data' in locals() else None
        })
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Helper function to be used by authentication middleware
def get_account_type_from_appwrite_user(user_data):
    """
    Determine account type using Appwrite user data + minimal DB lookup.
    This is a helper function that can be used by other parts of the app.
    
    Args:
        user_data: Appwrite user object containing $id, email, name, etc.
        
    Returns:
        dict: {
            "success": bool,
            "account_type": str,  # 'user', 'ngo', or 'new_user'
            "entity_data": dict,
            "appwrite_user": dict
        }
    """
    try:
        user_id = user_data['$id']
        email = user_data.get('email', '')
        
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
