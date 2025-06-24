from rest_framework.views import APIView
from rest_framework.reponse import Response
from reports.permissions import isAppwriteUser

class UserNotificationList(APIView):
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