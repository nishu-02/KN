from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from appwrite.client import Client
from appwrite.services.account import Account
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class AppwriteJWTAuthentication(BaseAuthentication):
    """
    Simple Appwrite JWT authentication that validates token and provides a compatible user object.
    """
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header[7:].strip()
        if not token:
            return None
        
        try:
            client = Client()
            client.set_endpoint(settings.APPWRITE_ENDPOINT)
            client.set_project(settings.APPWRITE_PROJECT_ID)
            client.set_jwt(token)
            
            account = Account(client)
            appwrite_user = account.get()
            
            # Create a DRF-compatible user object
            class AppwriteUser:
                def __init__(self, data):
                    self.pk = data['$id']  # Alias Appwrite ID to pk for throttling
                    self.id = data['$id']
                    self.email = data.get('email', '')
                    self.username = data.get('name', self.email) or self.email
                    self.is_authenticated = True
                    self.is_anonymous = False
                    self.is_active = True
                    self.is_staff = False
                    self.is_superuser = False
                    self._appwrite_data = data
                
                def get_username(self):
                    return self.username
                
                def __str__(self):
                    return self.username
                
                # For permissions - customize if needed
                def has_perm(self, perm, obj=None):
                    return True
                
                def has_perms(self, perm_list, obj=None):
                    return all(self.has_perm(perm, obj) for perm in perm_list)
                
                def has_module_perms(self, module):
                    return True
            
            user = AppwriteUser(appwrite_user)
            
            # Attach to request
            request.user_id = appwrite_user['$id']
            request.user_email = appwrite_user.get('email', '')
            request.appwrite_user = appwrite_user
            
            logger.info(f"Authentication successful for user {appwrite_user['$id']}")
            
            return (user, token)
        
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
    
    def authenticate_header(self, request):
        return 'Bearer realm="api"'
