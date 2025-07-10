from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from reports.models import InjuryReport
from user.models import UserProfile, VolunteerApplication
from ngo.models import NGO
from reports.serializers import InjuryReportSerializer
from user.serializers import UserProfileSerializer
from notifications.notification_triggers import notification_triggers

class UserReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'] url_path='own')
    def own(self, request):
        """ Get reports by the current user """
        user_id = request.user_id
        reports = InjuryReport.objects.filter(user_id=user_id)
        serializer = InjuryReportSerializer(reports, many=True)
        return Response(serailizer.data)

    @action(deatil=false, methods=['get'], url_path='helped')
    def helped(self, request):
        """ Get Reports where the user served as a volunteer """
        user_id = request.user_id
        try:
            profile = UserProfile.objects.get(appwrite_user_id=user_id)
        except UserProfile.DoesNotExist:
            return Response(
                [],
                status=status.HTTP_200_OK
            )
        
        reports = InjuryReport.objects.filter(volunteer_assigned=profile)
        serializer = InjuryReportSerializer(reports, many=True)
        return Response(serializer.data)

class UserProfileViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(deatil=False, methods=['patch'], url_path='toggle-volunteer')
    def toggle_volunteer(self, request):
        """ Toggle whether the user is a volunteer """
        
        user_id = request.user_id
        is_volunteer = request.data.get('is_volunteer')

        if is_volunteer is None:
            return Response({
                "error": "Missing is_volunteer parameter"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            profile = UserProfile.objects.get(appwrite_user_id=user_id)
            profile.is_volunteer = is_volunteer
            profile.save()
        
            return Response({
                "is_volunteer": profile.is_volunteer
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VolunteerApplicationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request, ngo_id=None):
        """ Apply to become a volunteer for an NGO """

        try:
            ngo = NGO.objects.filter(ngo_id=ngo_id)
            message = request.data.get('message')

            application, created = VolunteerApplication.objects.get_or_create(
                user_id=appwrite_user_id,
                ngo=ngo,
                defaults={
                    'message': message
                }
            )

            if not created:
                return Response({
                    'error': "You have already applied to this NGO"
                }, status=status.HTTP_409_CONFLICT)
            
            # Notify the NGO about the new volunteer application
            notification_triggers.notify_volunteer_application_submitted(application)
            
            return Response({
                "message": "Application submitted successfully",
            }, status=status.HTTP_201_CREATED)
        
        except NGO.DoesNotExist:
            return Response({
                "error": "NGO not found"
            }, status=status.HTTP_404_NOT_FOUND)