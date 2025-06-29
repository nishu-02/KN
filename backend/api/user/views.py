from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from reports.models import InjuryReport
from user.models import UserProfile
from reports.serializers import InjuryReportSerializer
from rest_framework.permissions import IsAuthenticated

class UserOwnReportsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user_id = request.user_id
        reports = InjuryReport.objects.filter(user_id=user_id)
        serializer = InjuryReportSerializer(reports, many=True)
        return Response(serializer.data)

class UserHelpedReportsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user_id = request.user_id
        try:
            profile = UserProfile.objects.get(appwrite_user_id=user_id)
        except UserProfile.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)
        reports = InjuryReport.objects.filter(volunteer_assigned=profile)
        serializer = InjuryReportSerializer(reports, many=True)
        return Response(serializer.data)

class ToggleVolunteerView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request):
        user_id = request.user_id
        is_volunteer = request.data.get('is_volunteer')
        if is_volunteer is None:
            return Response({'error': 'is_volunteer required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            profile, _ = UserProfile.objects.get_or_create(appwrite_user_id=user_id)
            profile.is_volunteer = bool(is_volunteer)
            profile.save()
            return Response({'is_volunteer': profile.is_volunteer}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ApplyVolunteerView(APIView):
    permission_classes = [IsAppwriteUser]
    
    def post(self, request, ngo_id):
        try:
            ngo = NGO.objects.get(ngo_id=ngo_id)
            message = request.data.get('message', '')

            application, created = VolunteerApplication.objects.get_or_create(
                user_id = request.user_id,
                ngo=ngo,
                defaults = (
                    'message': message
                )
            )

            if not created:
                return Response({
                    'error': 'You have already applied to this NGO'
                }, status=status.HTTP_201_CREATED)

            return Response({
                "message": "Application submitted successfully"
            }, status=status.HTTP_200_OK)

        except NGO.DoesNotExist:
            return Response({
                "error": "NGO not found"
            }, status=status.HTTP_404_NOT_FOUND)
