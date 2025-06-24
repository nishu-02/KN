from rest_framework.views import APIView
from rest_framework.reponse import Response
from rest_framework import status

from .models import NotificationHistory

from reports.permissions import isAppwriteUser


class UserNotificationListView(APIView):
    permission_classes = [isAppwriteUser]

    def get(self, request):
        notifications = NotificationHistory.objects.filter(user_id=request.user_id)
        data = [{
            "id": str(n.id),
            "title": n.title,
            "body": n.body,
            "data": n.data,
            "is_read": n.is_read,
            "created_at": n.created_at,
        } for n in notifications]

        return Response({
            "notifications": data
        })

class MarkNotificationAsViewed(APIView):
    permission_classes = [isAppwriteUser]

    def patch(self, request, notification_id):
        try:
            notification = NotificationHistory.objects.get(notification_id=notification_id)

            if notification.ngo_id != request.user_id:
                return Response({
                    "error": "Unauthorized"
                },status=status.HTTP_401_UNAUTHORIZED)

            notification.is_viewed = True
            notification.save()

            serializer = NotificationHistorySerializer(notification)
            return Response (
                serializer.data,
                status=status.HTTP_200_OK
            )

        except NotificationHistory.DoesNotExist:
            return Response({
                "error": "Notification not found"
            }, status=status.HTTP_404_NOT_FOUND)