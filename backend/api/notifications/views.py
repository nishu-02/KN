from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import NotificationHistory
from reports.permissions import IsAppwriteUser
from .serializers import NotificationHistorySerializer


class UserNotificationListView(APIView):
    permission_classes = [IsAppwriteUser]

    def get(self, request):
        notifications = NotificationHistory.objects.filter(recipient_id=request.user_id)
        data = [{
            "id": str(n.notification_id),
            "title": n.title,
            "body": n.body,
            "data": n.data,
            "is_read": n.is_read,
            "created_at": n.created_at,
        } for n in notifications]

        return Response({
            "notifications": data
        })


class MarkNotificationAsRead(APIView):
    permission_classes = [IsAppwriteUser]

    def patch(self, request, notification_id):
        try:
            notification = NotificationHistory.objects.get(notification_id=notification_id)

            if notification.recipient_id != request.user_id:
                return Response({
                    "error": "Unauthorized"
                }, status=status.HTTP_401_UNAUTHORIZED)

            notification.is_read = True
            notification.save()

            serializer = NotificationHistorySerializer(notification)
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        except NotificationHistory.DoesNotExist:
            return Response({
                "error": "Notification not found"
            }, status=status.HTTP_404_NOT_FOUND)