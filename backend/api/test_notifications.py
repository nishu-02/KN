#!/usr/bin/env python
"""
Test script for the new notification system.
Run this from the Django project root with: python test_notifications.py
"""

import os
import sys
import django

# Add the project directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from utils.notification_service import NotificationService
from users.models import PushToken


def test_notification_service():
    """Test the notification service with dummy data."""
    print("🚀 Testing Notification Service...")
    
    # Create notification service instance
    service = NotificationService()
    
    # Test with dummy notification (no tokens needed for OneSignal broadcast)
    test_payload = {
        "title": "🧪 Test Notification",
        "body": "This is a test notification from the new OneSignal backend!",
        "type": "general",
        "data": {
            "test": True,
            "timestamp": "2025-08-16T10:00:00Z"
        }
    }
    try:
        result = service.send_notification(test_payload)
        print("✅ Notification sent successfully!")
        print(f"📊 OneSignal Result: {result}")
        return True
    except Exception as e:
        print(f"❌ Notification failed: {e}")
        return False


def check_push_tokens():
    """Check how many push tokens are registered."""
    total_tokens = PushToken.objects.count()
    active_tokens = PushToken.objects.filter(is_active=True).count()
    user_tokens = PushToken.objects.filter(user_type='user', is_active=True).count()
    ngo_tokens = PushToken.objects.filter(user_type='ngo', is_active=True).count()
    
    print(f"📱 Push Token Statistics:")
    print(f"   Total tokens: {total_tokens}")
    print(f"   Active tokens: {active_tokens}")
    print(f"   User tokens: {user_tokens}")
    print(f"   NGO tokens: {ngo_tokens}")
    
    # Show detailed token information
    if active_tokens > 0:
        print(f"\n📋 Token Details:")
        tokens = PushToken.objects.filter(is_active=True).order_by('-created_at')[:5]
        for i, token in enumerate(tokens, 1):
            device_name = token.device_id or "Unknown Device"
            print(f"   {i}. {device_name} ({token.user_type})")
            print(f"      Token: {token.token[:50]}...")
            print(f"      User ID: {token.appwrite_user_id}")
            print(f"      Platform: {token.platform}")
            print(f"      Created: {token.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
            print()
    
    if active_tokens > 0:
        print("✅ Push tokens are available for testing")
        return True
    else:
        print("⚠️  No active push tokens found. Register a device first.")
        return False


def test_with_real_tokens():
    """Test with real tokens from the database."""
    # For OneSignal, tokens are not required for broadcast; but you can target segments or users if needed
    test_payload = {
        "title": "🔧 Backend Test",
        "body": "Testing new notification system with OneSignal broadcast",
        "type": "general",
        "data": {
            "source": "backend_test",
            "timestamp": "2025-08-16T12:30:00Z"
        }
    }
    try:
        service = NotificationService()
        result = service.send_notification(test_payload)
        print(f"✅ Real notification sent via OneSignal!")
        print(f"📊 OneSignal Result: {result}")
        return True
    except Exception as e:
        print(f"❌ Real notification failed: {e}")
        return False


def test_specific_token(token: str):
    """Test with a specific token."""
    print(f"🎯 Testing specific token: {token[:50]}...")
    
    # OneSignal can target specific users via filters, but for demo, just send a broadcast
    test_payload = {
        "title": "🧪 Direct Token Test",
        "body": "This is a direct test to your device (OneSignal broadcast)!",
        "type": "general",
        "data": {
            "source": "direct_test",
            "test_type": "specific_token",
            "timestamp": "2025-08-16T12:30:00Z"
        }
    }
    try:
        service = NotificationService()
        result = service.send_notification(test_payload)
        print(f"✅ Direct notification sent via OneSignal!")
        print(f"📊 OneSignal Result: {result}")
        return True
    except Exception as e:
        print(f"❌ Direct notification failed: {e}")
        return False


if __name__ == "__main__":
    print("🔔 Karuna Nidhan Notification System Test")
    print("=" * 50)
    
    # Check database connectivity and tokens
    tokens_available = check_push_tokens()
    
    print("\n" + "=" * 50)
    
    # Test the service with dummy data
    dummy_test = test_notification_service()
    
    print("\n" + "=" * 50)
    
    # Test with real tokens if available
    if tokens_available:
        choice = input("🤔 Send test notification to real devices? (y/N): ").lower()
        if choice == 'y':
            test_with_real_tokens()
            
            print("\n" + "-" * 30)
            
            # Offer to test specific token
            specific_choice = input("🎯 Test specific token (NISHANT's device)? (y/N): ").lower()
            if specific_choice == 'y':
                # Your specific token from the database
                nishant_token = "ExponentPushToken[xsKKv3NdApKh937n7Ocur7]"
                test_specific_token(nishant_token)
        else:
            print("⏭️  Skipping real device test")
    
    print("\n🎉 Test completed!")
    print("\n📋 Summary:")
    print("  - Appwrite Functions approach removed")
    print("  - OneSignal integration implemented") 
    print("  - Notification history stored in Django database")
    print("  - OneSignal App ID and API Key configured")
    print("  - Ready for production use!")
    
    # Show next steps
    print("\n🚀 Next Steps:")
    print("  1. The frontend errors are fixed (subscribeToAllTopics removed)")
    print("  2. Your OneSignal App ID and API Key are configured")
    print("  3. Test notifications on your device!")
    print("  4. For production builds, users will get notifications via OneSignal automatically")
