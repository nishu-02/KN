from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from appwrite.client import Client
from appwrite.services.account import Account
from django.conf import settings
from .appwrite_auth import appwrite_login_with_account_detection
import json

@api_view(['POST'])
@permission_classes([AllowAny])
def appwrite_login(request):
    """
    Appwrite-first login with account type detection
    - Appwrite handles authentication (credentials verification)
    - Django only provides account type information
    - No custom JWT creation, uses Appwrite JWT directly
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({
            "error": "Email and password are required"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Use Appwrite for authentication + account type detection
    auth_result = appwrite_login_with_account_detection(email, password)
    
    if not auth_result["success"]:
        return Response({
            "error": f"Authentication failed: {auth_result['error']}"
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response({
        "success": True,
        "appwrite_jwt": auth_result["appwrite_jwt"],  # Use this for all API calls
        "session": {
            "session_id": auth_result["appwrite_session"]["$id"],
            "expires": auth_result["appwrite_session"]["expire"]
        },
        "user_info": {
            "user_id": auth_result["user_id"],
            "account_type": auth_result["account_type"],
            **auth_result["entity_data"]
        },
        "appwrite_user": auth_result["appwrite_user"],
        "frontend_usage": {
            "authentication": "✅ Handled by Appwrite",
            "authorization": f"Use appwrite_jwt for API calls: Bearer {auth_result['appwrite_jwt'][:20]}...",
            "navigation": f"Navigate to {'NGO' if auth_result['account_type'] == 'ngo' else 'User'} dashboard",
            "account_detection": "Account type from Django DB (minimal lookup)",
            "storage": "Store appwrite_jwt + account_type locally"
        }
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def get_bearer_token(request):
    """
    Helper endpoint to get bearer token for API testing.
    This should only be used in DEBUG mode for development.
    """
    if not settings.DEBUG:
        return Response({
            "error": "This endpoint is only available in DEBUG mode"
        }, status=status.HTTP_403_FORBIDDEN)
    
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({
            "error": "Email and password are required",
            "usage": {
                "method": "POST",
                "body": {
                    "email": "your_email@example.com",
                    "password": "your_password"
                }
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create Appwrite client
        client = Client()
        client.set_endpoint(settings.APPWRITE_ENDPOINT)
        client.set_project(settings.APPWRITE_PROJECT_ID)
        
        account = Account(client)
        
        # Create session (login)
        session = account.create_email_session(email, password)
        
        # Get JWT token
        jwt = account.create_jwt()
        
        return Response({
            "success": True,
            "bearer_token": jwt['jwt'],
            "usage": f"Authorization: Bearer {jwt['jwt']}",
            "instructions": [
                "1. Copy the bearer_token value",
                "2. Go to Swagger UI",
                "3. Click 'Authorize' button",
                "4. Enter: Bearer <your_token>",
                "5. Now you can test all endpoints"
            ],
            "user_info": {
                "user_id": session['userId'],
                "email": email
            }
        })
        
    except Exception as e:
        return Response({
            "error": f"Authentication failed: {str(e)}",
            "note": "Make sure the email and password are correct and the user exists in Appwrite"
        }, status=status.HTTP_401_UNAUTHORIZED)
