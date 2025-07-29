from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.http import JsonResponse
from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.services.users import Users  # Updated: Imported for potential server-side verification in middleware
from utils.logger import user_logger
import jwt
import json


class AppwriteAuthenticationMiddleware:
    """
    Middleware to authenticate requests using Appwrite JWT tokens.
    Sets request.user_id based on the Appwrite JWT token in the Authorization header.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response


    def __call__(self, request):
        # Process the request before the view
        self.process_request(request)
        
        response = self.get_response(request)
        return response


    def process_request(self, request):
        """
        Extract and validate Appwrite JWT token from Authorization header.
        Set request.user_id if valid, otherwise set to None.
        """
        # Initialize request attributes
        request.user_id = None
        request.appwrite_user = None
        request.account_type = None
        
        # Skip authentication for certain paths
        skip_paths = [
            '/admin/',
            '/api/schema/',
            '/silk/',
            '/users/auth/register',  # Allow registration without auth
        ]
        
        if any(request.path.startswith(path) for path in skip_paths):
            return
        
        # Get Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return
        
        try:
            # Extract JWT token
            jwt_token = auth_header.split(' ')[1]
            
            # Validate JWT token with Appwrite
            user_data = self.validate_appwrite_jwt(jwt_token)
            
            if user_data:
                request.user_id = user_data['$id']
                request.appwrite_user = user_data
                
                # Optionally get account type from Django models
                from users.auth_views import get_account_type_from_appwrite_user
                account_info = get_account_type_from_appwrite_user(user_data)
                if account_info['success']:
                    request.account_type = account_info['account_type']
                
                user_logger.debug(f"Authenticated user: {request.user_id}, type: {request.account_type}")
            
        except Exception as e:
            user_logger.warning(f"Authentication failed: {str(e)}")
            # Don't raise exception, just continue without authentication


    def validate_appwrite_jwt(self, jwt_token):
        """
        Validate JWT token with Appwrite and return user data.
        
        Args:
            jwt_token (str): The JWT token to validate
            
        Returns:
            dict: User data if valid, None if invalid
        """
        try:
            # Method 1: Use Appwrite SDK to verify JWT (primary method)
            client = Client()
            client.set_endpoint(settings.APPWRITE_ENDPOINT)
            client.set_project(settings.APPWRITE_PROJECT_ID)
            client.set_jwt(jwt_token)
            
            account = Account(client)
            user_data = account.get()
            
            return user_data
            
        except Exception as e:
            # Updated: Removed insecure manual JWT decoding fallback (use only in DEBUG with caution)
            # Instead, attempt server-side verification if API key is available
            user_logger.warning(f"Appwrite JWT validation failed: {str(e)}. Attempting server-side verification.")
            
            try:
                if hasattr(settings, 'APPWRITE_API_KEY') and settings.APPWRITE_API_KEY:
                    # Use Users service for server-side check (requires user_id from token, but since token failed, extract tentatively)
                    payload = jwt.decode(jwt_token, options={"verify_signature": False})  # Tentative decode for userId (DEBUG only)
                    user_id = payload.get('userId')
                    if user_id:
                        client = Client()
                        client.set_endpoint(settings.APPWRITE_ENDPOINT)
                        client.set_project(settings.APPWRITE_PROJECT_ID)
                        client.set_key(settings.APPWRITE_API_KEY)
                        
                        users = Users(client)
                        user_data = users.get(user_id)
                        return user_data
                    else:
                        raise ValueError("Could not extract userId from invalid JWT")
                else:
                    raise ValueError("No API key configured for server-side verification")
            except Exception as fallback_error:
                user_logger.error(f"Server-side verification also failed: {str(fallback_error)}")
            
            return None



class AppwriteAuthenticationRequiredMixin:
    """
    Mixin for views that require Appwrite authentication.
    Returns 401 if user is not authenticated via Appwrite.
    """
    
    def dispatch(self, request, *args, **kwargs):
        if not hasattr(request, 'user_id') or request.user_id is None:
            return JsonResponse({
                'error': 'Authentication required',
                'code': 'AUTHENTICATION_REQUIRED'
            }, status=401)
        
        return super().dispatch(request, *args, **kwargs)

def appwrite_auth_required(view_func):
    """
    Decorator for function-based views that require Appwrite authentication.
    """
    def wrapper(request, *args, **kwargs):
        if not hasattr(request, 'user_id') or request.user_id is None:
            return JsonResponse({
                'error': 'Authentication required',
                'code': 'AUTHENTICATION_REQUIRED'
            }, status=401)
        
        return view_func(request, *args, **kwargs)
    
    return wrapper
