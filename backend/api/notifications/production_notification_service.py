"""
PRODUCTION NOTIFICATION SERVICE
Complete, reliable notification system for KarunaNidhan app
Handles all 4 types of notifications with proper filtering and preferences
"""

import json
import uuid
from typing import List, Dict, Optional, Set
from datetime import datetime
from django.utils import timezone
from django.db import transaction
from django.conf import settings

import requests
from celery import shared_task

from .models import NotificationHistory
from users.models import UserProfile, UserPushToken
from ngo.models import NGO
from utils.logger import notifications_logger


class ProductionNotificationService:
    """
    Production-ready notification service that handles:
    1. Emergency Alerts - All users
    2. Status Updates - Specific users  
    3. Injury Report Notifications - Only volunteers and NGOs
    4. General Announcements - All users (respects preferences)
    """
    
    def __init__(self):
        self.expo_push_url = "https://exp.host/--/api/v2/push/send"
        self.batch_size = 100  # Send in batches to avoid rate limits
    
    def send_emergency_alert(self, report_id: str, location: str, description: str = "") -> bool:
        """
        Send emergency alert to ALL users immediately
        This bypasses notification preferences as it's critical
        """
        try:
            # Get all active users with push tokens
            user_tokens = self._get_all_active_user_tokens()
            
            if not user_tokens:
                notifications_logger.warning("No active users found for emergency alert")
                return False
            
            title = "🚨 EMERGENCY ALERT"
            body = f"Emergency reported at {location}. {description}"
            data = {
                'type': 'emergency',
                'report_id': report_id,
                'location': location,
                'urgent': True,
                'action': 'open_report'
            }
            
            # Send immediately (urgent)
            success = self._send_to_users_immediate(
                user_tokens=user_tokens,
                title=title,
                body=body,
                data=data,
                notification_type='emergency'
            )
            
            notifications_logger.info(f"Emergency alert sent to {len(user_tokens)} users")
            return success
            
        except Exception as e:
            notifications_logger.error(f"Failed to send emergency alert: {e}")
            return False
    
    def send_injury_report_notification(self, report_id: str, location: str, description: str = "") -> bool:
        """
        Send injury report notification ONLY to:
        1. Users who are volunteers (is_volunteer=True)
        2. NGO users
        3. Users who have injury_reports preference enabled
        """
        try:
            # Get volunteers and NGO users
            target_users = self._get_volunteer_and_ngo_users()
            
            if not target_users:
                notifications_logger.warning("No volunteers or NGOs found for injury report")
                return False
            
            title = "🐕 New Injury Report"
            body = f"A stray animal needs help at {location}. {description}"
            data = {
                'type': 'injury_report',
                'report_id': report_id,
                'location': location,
                'action': 'open_report'
            }
            
            # Send asynchronously (not urgent)
            send_notification_async.delay(
                user_tokens=target_users,
                title=title,
                body=body,
                data=data,
                notification_type='injury_report'
            )
            
            notifications_logger.info(f"Injury report notification queued for {len(target_users)} volunteers/NGOs")
            return True
            
        except Exception as e:
            notifications_logger.error(f"Failed to send injury report notification: {e}")
            return False
    
    def send_status_update(self, user_id: str, report_id: str, new_status: str, location: str = "") -> bool:
        """
        Send status update to specific user about their report
        """
        try:
            # Get specific user's tokens
            user_tokens = self._get_user_tokens(user_id)
            
            if not user_tokens:
                notifications_logger.warning(f"No push tokens found for user {user_id}")
                return False
            
            # Check if user wants status updates
            if not self._user_wants_notification(user_id, 'status_updates'):
                notifications_logger.info(f"User {user_id} has disabled status update notifications")
                return True  # Not an error, just user preference
            
            status_messages = {
                'pending': 'Your report is pending review',
                'in_progress': 'Your report is now being handled', 
                'assigned': 'A volunteer has been assigned to your report',
                'resolved': 'Great news! Your report has been resolved',
                'cancelled': 'Your report has been cancelled'
            }
            
            title = "📋 Report Status Update"
            body = status_messages.get(new_status, f"Your report status: {new_status}")
            data = {
                'type': 'status_update',
                'report_id': report_id,
                'status': new_status,
                'location': location,
                'action': 'open_report'
            }
            
            # Send immediately for status updates
            success = self._send_to_users_immediate(
                user_tokens=user_tokens,
                title=title,
                body=body,
                data=data,
                notification_type='status_update'
            )
            
            return success
            
        except Exception as e:
            notifications_logger.error(f"Failed to send status update: {e}")
            return False
    
    def send_general_announcement(self, title: str, body: str, user_ids: Optional[List[str]] = None) -> bool:
        """
        Send general announcement to all users (or specific users)
        Respects user notification preferences
        """
        try:
            if user_ids:
                # Send to specific users
                target_users = []
                for user_id in user_ids:
                    if self._user_wants_notification(user_id, 'general_announcements'):
                        tokens = self._get_user_tokens(user_id)
                        target_users.extend(tokens)
            else:
                # Send to all users who want general announcements
                target_users = self._get_users_wanting_general_announcements()
            
            if not target_users:
                notifications_logger.warning(f"No push tokens found for users: {user_ids if user_ids else 'all users'}")
                return False
            
            data = {
                'type': 'general',
                'action': 'open_announcements'
            }
            
            # Send asynchronously
            send_notification_async.delay(
                user_tokens=target_users,
                title=title,
                body=body,
                data=data,
                notification_type='general'
            )
            
            notifications_logger.info(f"Scheduled notification for {len(target_users)} devices")
            return True
            
            notifications_logger.info(f"General announcement queued for {len(target_users)} users")
            return True
            
        except Exception as e:
            notifications_logger.error(f"Failed to send general announcement: {e}")
            return False
    
    def register_user_device(self, user_id: str, push_token: str, device_id: str = "", platform: str = "") -> bool:
        """
        Register user device for push notifications
        """
        try:
            # Get or create user profile
            user_profile, created = UserProfile.objects.get_or_create(
                appwrite_user_id=user_id,
                defaults={'name': '', 'email': ''}
            )
            
            # Update or create push token
            token_obj, token_created = UserPushToken.objects.update_or_create(
                user=user_profile,
                token=push_token,
                defaults={
                    'appwrite_user_id': user_id,
                    'device_id': device_id,
                    'platform': platform,
                    'is_active': True,
                    'last_used': timezone.now()
                }
            )
            
            # Deactivate old tokens for this user on same device
            if device_id:
                UserPushToken.objects.filter(
                    user=user_profile,
                    device_id=device_id
                ).exclude(token=push_token).update(is_active=False)
            
            notifications_logger.info(f"Registered push token for user {user_id}")
            return True
            
        except Exception as e:
            notifications_logger.error(f"Failed to register device: {e}")
            return False
    
    def update_notification_preferences(self, user_id: str, preferences: Dict) -> bool:
        """
        Update user notification preferences
        """
        try:
            user_profile = UserProfile.objects.get(appwrite_user_id=user_id)
            
            # Validate preferences
            valid_keys = ['emergency_alerts', 'status_updates', 'general_announcements', 'injury_reports']
            filtered_prefs = {k: v for k, v in preferences.items() if k in valid_keys}
            
            # Emergency alerts cannot be disabled (safety requirement)
            filtered_prefs['emergency_alerts'] = True
            
            # Injury reports can only be enabled if user is volunteer
            if 'injury_reports' in filtered_prefs and not user_profile.is_volunteer:
                filtered_prefs['injury_reports'] = False
            
            user_profile.notification_preferences.update(filtered_prefs)
            user_profile.save()
            
            notifications_logger.info(f"Updated notification preferences for user {user_id}")
            return True
            
        except UserProfile.DoesNotExist:
            notifications_logger.error(f"User {user_id} not found")
            return False
        except Exception as e:
            notifications_logger.error(f"Failed to update preferences: {e}")
            return False
    
    def _get_all_active_user_tokens(self) -> List[Dict]:
        """Get all active user tokens for emergency alerts"""
        return list(
            UserPushToken.objects.filter(is_active=True)
            .select_related('user')
            .values('token', 'user__appwrite_user_id', 'user__name')
        )
    
    def _get_volunteer_and_ngo_users(self) -> List[Dict]:
        """Get users who should receive injury report notifications"""
        # Get volunteers who want injury report notifications
        volunteer_tokens = list(
            UserPushToken.objects.filter(
                is_active=True,
                user__is_volunteer=True,
                user__notification_preferences__injury_reports=True
            ).select_related('user')
            .values('token', 'user__appwrite_user_id', 'user__name')
        )
        
        # Get NGO users (they always get injury reports)
        ngo_user_ids = NGO.objects.values_list('appwrite_user_id', flat=True)
        ngo_tokens = list(
            UserPushToken.objects.filter(
                is_active=True,
                user__appwrite_user_id__in=ngo_user_ids
            ).select_related('user')
            .values('token', 'user__appwrite_user_id', 'user__name')
        )
        
        # Combine and deduplicate
        all_tokens = volunteer_tokens + ngo_tokens
        seen = set()
        unique_tokens = []
        for token in all_tokens:
            if token['token'] not in seen:
                seen.add(token['token'])
                unique_tokens.append(token)
        
        return unique_tokens
    
    def _get_users_wanting_general_announcements(self) -> List[Dict]:
        """Get users who want general announcements"""
        return list(
            UserPushToken.objects.filter(
                is_active=True,
                user__notification_preferences__general_announcements=True
            ).select_related('user')
            .values('token', 'user__appwrite_user_id', 'user__name')
        )
    
    def _get_user_tokens(self, user_id: str) -> List[Dict]:
        """Get all active tokens for a specific user"""
        return list(
            UserPushToken.objects.filter(
                is_active=True,
                user__appwrite_user_id=user_id
            ).select_related('user')
            .values('token', 'user__appwrite_user_id', 'user__name')
        )
    
    def _user_wants_notification(self, user_id: str, notification_type: str) -> bool:
        """Check if user wants this type of notification"""
        try:
            user = UserProfile.objects.get(appwrite_user_id=user_id)
            prefs = user.notification_preferences or user.get_default_notification_preferences()
            return prefs.get(notification_type, True)
        except UserProfile.DoesNotExist:
            return True  # Default to True if user not found
    
    def _send_to_users_immediate(self, user_tokens: List[Dict], title: str, body: str, data: Dict, notification_type: str) -> bool:
        """Send notifications immediately to users"""
        try:
            # Prepare Expo push notifications
            expo_messages = []
            user_ids = []
            
            for user_token in user_tokens:
                if user_token['token'].startswith('ExponentPushToken['):
                    expo_messages.append({
                        "to": user_token['token'],
                        "title": title,
                        "body": body,
                        "data": data,
                        "sound": "default",
                        "badge": 1,
                        "priority": "high" if data.get('urgent') else "normal"
                    })
                    user_ids.append(user_token['user__appwrite_user_id'])
            
            if not expo_messages:
                return False
            
            # Send in batches
            success = True
            for i in range(0, len(expo_messages), self.batch_size):
                batch = expo_messages[i:i + self.batch_size]
                batch_user_ids = user_ids[i:i + self.batch_size]
                
                if not self._send_expo_batch(batch):
                    success = False
                else:
                    # Log successful notifications
                    self._log_notifications(batch_user_ids, title, body, data, notification_type)
            
            return success
            
        except Exception as e:
            notifications_logger.error(f"Failed to send immediate notifications: {e}")
            return False
    
    def _send_expo_batch(self, messages: List[Dict]) -> bool:
        """Send a batch of messages to Expo push service"""
        try:
            response = requests.post(
                self.expo_push_url,
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                data=json.dumps(messages),
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                # Check for any errors in the batch
                errors = [msg for msg in result.get('data', []) if msg.get('status') == 'error']
                if errors:
                    notifications_logger.warning(f"Some notifications failed: {errors}")
                
                notifications_logger.info(f"✅ Sent batch of {len(messages)} notifications")
                return True
            else:
                notifications_logger.error(f"❌ Expo push failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            notifications_logger.error(f"❌ Expo batch send error: {e}")
            return False
    
    def _log_notifications(self, user_ids: List[str], title: str, body: str, data: Dict, notification_type: str):
        """Log notifications to database"""
        try:
            notifications = []
            for user_id in user_ids:
                notifications.append(
                    NotificationHistory(
                        notification_id=uuid.uuid4(),
                        recipient_id=user_id,
                        recipient_type='user',
                        notification_type=notification_type,
                        title=title,
                        body=body,
                        data=data,
                        status='sent',
                        is_urgent=data.get('urgent', False),
                        sent_at=timezone.now()
                    )
                )
            
            # Bulk create for efficiency
            NotificationHistory.objects.bulk_create(notifications, batch_size=100)
            
        except Exception as e:
            notifications_logger.error(f"Failed to log notifications: {e}")


# Global service instance
notification_service = ProductionNotificationService()

# Celery task for async notifications
@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_notification_async(self, user_tokens: List[Dict], title: str, body: str, data: Dict, notification_type: str):
    """
    Celery task to send notifications asynchronously
    """
    try:
        notifications_logger.info(f"Processing async notification: {title} to {len(user_tokens)} users")
        
        success = notification_service._send_to_users_immediate(
            user_tokens=user_tokens,
            title=title,
            body=body,
            data=data,
            notification_type=notification_type
        )
        
        if not success:
            raise Exception("Failed to send async notifications")
            
        notifications_logger.info(f"✅ Async notification completed: {title}")
        
    except Exception as exc:
        notifications_logger.error(f"❌ Async notification failed: {exc}")
        raise self.retry(exc=exc)


# Convenience functions for easy usage
def send_emergency_alert(report_id: str, location: str, description: str = "") -> bool:
    """Send emergency alert to all users"""
    return notification_service.send_emergency_alert(report_id, location, description)

def send_injury_report_notification(report_id: str, location: str, description: str = "") -> bool:
    """Send injury report notification to volunteers and NGOs"""
    return notification_service.send_injury_report_notification(report_id, location, description)

def send_status_update(user_id: str, report_id: str, new_status: str, location: str = "") -> bool:
    """Send status update to specific user"""
    return notification_service.send_status_update(user_id, report_id, new_status, location)

def send_general_announcement(title: str, body: str, user_ids: Optional[List[str]] = None) -> bool:
    """Send general announcement"""
    return notification_service.send_general_announcement(title, body, user_ids)

def register_device(user_id: str, push_token: str, device_id: str = "", platform: str = "") -> bool:
    """Register user device for notifications"""
    return notification_service.register_user_device(user_id, push_token, device_id, platform)

def update_notification_preferences(user_id: str, preferences: Dict) -> bool:
    """Update user notification preferences"""
    return notification_service.update_notification_preferences(user_id, preferences)
