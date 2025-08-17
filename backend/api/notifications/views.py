from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q

from .models import Notification, NotificationPreferences
from utils.logger import user_logger, log_api_request


class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationViewSet(viewsets.ViewSet):
    """
    ViewSet for managing user notifications
    """
    permission_classes = [IsAuthenticated]
    pagination_class = NotificationPagination

    def list(self, request):
        """Get notification history for the authenticated user"""
        try:
            user_id = request.user_id
            page_size = int(request.query_params.get('page_size', 20))
            
            notifications = Notification.objects.filter(
                recipient_user_id=user_id
            ).order_by('-created_at')[:page_size]
            
            data = [{
                'id': str(notif.id),
                'type': notif.type,
                'title': notif.title,
                'body': notif.body,
                'data': notif.data,
                'is_read': notif.is_read,
                'is_urgent': notif.is_urgent,
                'created_at': notif.created_at.isoformat(),
                'sent_at': notif.sent_at.isoformat() if notif.sent_at else None,
                'read_at': notif.read_at.isoformat() if notif.read_at else None,
            } for notif in notifications]
            
            return Response({
                'notifications': data,
                'count': len(data)
            })
            
        except Exception as e:
            user_logger.error(f"Error fetching notifications for user {request.user_id}: {e}")
            return Response({
                'error': 'Failed to fetch notifications'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        """Mark a specific notification as read"""
        try:
            user_id = request.user_id
            notification = Notification.objects.get(
                id=pk,
                recipient_user_id=user_id
            )
            
            if not notification.is_read:
                notification.is_read = True
                notification.read_at = timezone.now()
                notification.save()
            
            return Response({'success': True})
            
        except Notification.DoesNotExist:
            return Response({
                'error': 'Notification not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            user_logger.error(f"Error marking notification as read: {e}")
            return Response({
                'error': 'Failed to mark notification as read'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        """Mark all notifications as read for the authenticated user"""
        try:
            user_id = request.user_id
            updated_count = Notification.objects.filter(
                recipient_user_id=user_id,
                is_read=False
            ).update(
                is_read=True,
                read_at=timezone.now()
            )
            
            return Response({
                'success': True,
                'updated_count': updated_count
            })
            
        except Exception as e:
            user_logger.error(f"Error marking all notifications as read: {e}")
            return Response({
                'error': 'Failed to mark notifications as read'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get', 'post'], url_path='preferences')
    def preferences(self, request):
        """Get or update notification preferences"""
        try:
            user_id = request.user_id
            
            if request.method == 'GET':
                prefs, _ = NotificationPreferences.objects.get_or_create(
                    user_id=user_id
                )
                return Response({
                    'emergency_alerts': prefs.emergency_alerts,
                    'status_updates': prefs.status_updates,
                    'general_announcements': prefs.general_announcements,
                    'injury_reports': prefs.injury_reports,
                })
            
            elif request.method == 'POST':
                prefs, _ = NotificationPreferences.objects.get_or_create(
                    user_id=user_id
                )
                
                # Update preferences from request data
                if 'emergency_alerts' in request.data:
                    prefs.emergency_alerts = request.data['emergency_alerts']
                if 'status_updates' in request.data:
                    prefs.status_updates = request.data['status_updates']
                if 'general_announcements' in request.data:
                    prefs.general_announcements = request.data['general_announcements']
                if 'injury_reports' in request.data:
                    prefs.injury_reports = request.data['injury_reports']
                
                prefs.save()
                
                return Response({
                    'success': True,
                    'preferences': {
                        'emergency_alerts': prefs.emergency_alerts,
                        'status_updates': prefs.status_updates,
                        'general_announcements': prefs.general_announcements,
                        'injury_reports': prefs.injury_reports,
                    }
                })
                
        except Exception as e:
            user_logger.error(f"Error handling notification preferences: {e}")
            return Response({
                'error': 'Failed to handle notification preferences'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='send-test-notification')
    def send_test_notification(self, request):
        """Send a test notification (for development/testing)"""
        try:
            user_id = request.user_id
            
            # Create a test notification
            notification = Notification.objects.create(
                recipient_user_id=user_id,
                type='general',
                title='Test Notification',
                body='This is a test notification from KarunaNidhan',
                data={'test': True},
                sent_at=timezone.now()
            )
            
            return Response({
                'success': True,
                'notification_id': str(notification.id)
            })
            
        except Exception as e:
            user_logger.error(f"Error sending test notification: {e}")
            return Response({
                'error': 'Failed to send test notification'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
