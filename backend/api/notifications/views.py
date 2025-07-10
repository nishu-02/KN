from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import time

from .notification_service import AppwriteNotificationService
from .notification_triggers import notification_triggers

class NotificationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Initialize your notification service here
        self.appwrite_service = AppwriteNotificationService()

    @action(detail=False, methods=['post'], url_path='register_device')
    def register_device(self, request):
        """ Register a device for push notifications """
        push_token = request.data.get('push_token')
        topics = request.data.get('topics', ['general'])

        if not push_token:
            return Response({
                "error": "Push token is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user_id = request.user_id
        success_count = 0

        for topic in topics:
            if self.appwrite_service.subscribe_user_to_topic(
                user_id,
                topic,
                push_token
            ):
                success_count += 1

        return Response({
            "message": f"Successfully registered for {success_count} topics",
            "topics": topics
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='send-test')
    def send_test_notification(self, request):
        """ Send a test notification to the user """
        if not settings.DEBUG:
            return Response({
                "error": "Test notifications are only allowed in debug mode"
            }, status=status.HTTP_403_FORBIDDEN)

        user_id = request.user_id

        success = self.appwrite_service.send_push_notifications(
            topic='general',
            title='Test Notification',
            body='This is a test notification from the API.',
            data={'type': 'test', 'timestamp': str(time.time())},
            user_ids=[user_id]
        )

        if success:
            return Response({
                "message": "Test notification sent successfully"
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "error": "Failed to send test notification"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='history')
    def get_notification_history(self, request):
        """ Get notification history for the current user """
        from .models import NotificationHistory
        
        user_id = request.user_id
        notifications = NotificationHistory.objects.filter(
            recipient_id=user_id
        ).order_by('-created_at')[:50]  # Last 50 notifications
        
        data = [{
            'id': str(notification.notification_id),
            'title': notification.title,
            'body': notification.body,
            'data': notification.data,
            'is_read': notification.is_read,
            'created_at': notification.created_at.isoformat()
        } for notification in notifications]
        
        return Response({
            'notifications': data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='mark-read')
    def mark_as_read(self, request, pk=None):
        """ Mark a notification as read """
        from .models import NotificationHistory
        
        try:
            notification = NotificationHistory.objects.get(
                notification_id=pk,
                recipient_id=request.user_id
            )
            notification.is_read = True
            notification.save()
            
            return Response({
                "message": "Notification marked as read"
            }, status=status.HTTP_200_OK)
            
        except NotificationHistory.DoesNotExist:
            return Response({
                "error": "Notification not found"
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='send-announcement')
    def send_announcement(self, request):
        """ Send a general announcement (admin only) """
        # TODO: Add admin permission check
        title = request.data.get('title')
        body = request.data.get('body')
        topic = request.data.get('topic', 'general')
        user_ids = request.data.get('user_ids')  # Optional specific users
        
        if not title or not body:
            return Response({
                "error": "Title and body are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        notification_triggers.notify_general_announcement(
            title=title,
            body=body,
            user_ids=user_ids,
            topic=topic
        )
        
        return Response({
            "message": "Announcement sent successfully"
        }, status=status.HTTP_200_OK)


# Utility methods for sending notifications (keeping for backward compatibility)
def send_injury_report_notification(injury_report):
    """ Send notification for a new injury report """
    notification_triggers.notify_new_injury_report(injury_report)

def send_volunteer_assigned_notification(volunteer_id, injury_report):
    """ Send notification when a volunteer is assigned to an injury report """
    from user.models import UserProfile
    
    try:
        volunteer = UserProfile.objects.get(appwrite_user_id=volunteer_id)
        notification_triggers.notify_volunteer_assigned(injury_report, volunteer)
    except UserProfile.DoesNotExist:
        print(f"Volunteer with ID {volunteer_id} not found")