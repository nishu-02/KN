from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

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
        