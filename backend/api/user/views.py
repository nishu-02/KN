from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from reports.models import InjuryReport
from user.models import UserProfile, VolunteerApplication
from ngo.models import NGO
from reports.serializers import InjuryReportSerializer
from user.serializers import UserProfileSerializer, NotificationPreferencesSerializer
from notifications.notification_triggers import notification_triggers
from .services.avatar_service import AvatarService

class UserReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='own')
    def own(self, request):
        """ Get reports by the current user """
        user_id = request.user_id
        reports = InjuryReport.objects.filter(user_id=user_id)
        serializer = InjuryReportSerializer(reports, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='helped')
    def helped(self, request):
        """ Get Reports where the user served as a volunteer """
        user_id = request.user_id
        try:
            profile = UserProfile.objects.get(appwrite_user_id=user_id)
        except UserProfile.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)
        
        reports = InjuryReport.objects.filter(volunteer_assigned=profile)
        serializer = InjuryReportSerializer(reports, many=True)
        return Response(serializer.data)

class UserProfileViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    @action(detail=False, methods=['get'], url_path='me')
    def get_profile(self, request):
        """ Get current user's profile """
        try:
            profile = UserProfile.objects.get(appwrite_user_id=request.user_id)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({
                "error": "Profile not found"
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['patch'], url_path='update')
    def update_profile(self, request):
        """ Update user profile """
        try:
            profile = UserProfile.objects.get(appwrite_user_id=request.user_id)
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except UserProfile.DoesNotExist:
            return Response({
                "error": "Profile not found"
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['patch'], url_path='toggle-volunteer')
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

    @action(detail=False, methods=['post'], url_path='upload-avatar')
    def upload_avatar(self, request):
        """ Upload user avatar """
        try:
            image_file = request.FILES.get('avatar')
            user_id = request.user_id
            
            if not image_file:
                return Response({
                    "error": "Avatar image is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate file size (max 5MB)
            if image_file.size > 5 * 1024 * 1024:
                return Response({
                    "error": "Image size must be less than 5MB"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Upload to Appwrite
            avatar_service = AvatarService()
            avatar_url = avatar_service.upload_avatar(image_file, user_id)
            
            if not avatar_url:
                return Response({
                    "error": "Failed to upload avatar"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Update user profile
            profile = UserProfile.objects.get(appwrite_user_id=user_id)
            
            # Delete old avatar if exists
            if profile.avatar_url:
                avatar_service.delete_avatar(profile.avatar_url)
            
            profile.avatar_url = avatar_url
            profile.save()
            
            return Response({
                "message": "Avatar uploaded successfully",
                "avatar_url": avatar_url
            }, status=status.HTTP_200_OK)
            
        except UserProfile.DoesNotExist:
            return Response({
                "error": "User profile not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": f"Upload failed: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['delete'], url_path='remove-avatar')
    def remove_avatar(self, request):
        """ Remove user avatar """
        try:
            user_id = request.user_id
            profile = UserProfile.objects.get(appwrite_user_id=user_id)
            
            if profile.avatar_url:
                # Delete from Appwrite
                avatar_service = AvatarService()
                avatar_service.delete_avatar(profile.avatar_url)
                
                # Clear from database
                profile.avatar_url = ""
                profile.save()
            
            return Response({
                "message": "Avatar removed successfully"
            }, status=status.HTTP_200_OK)
            
        except UserProfile.DoesNotExist:
            return Response({
                "error": "User profile not found"
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['patch'], url_path='notification-preferences')
    def update_notification_preferences(self, request):
        """ Update notification preferences """
        try:
            profile = UserProfile.objects.get(appwrite_user_id=request.user_id)
            serializer = NotificationPreferencesSerializer(data=request.data)
            
            if serializer.is_valid():
                profile.notification_preferences = serializer.validated_data
                profile.save()
                
                return Response({
                    "message": "Notification preferences updated",
                    "preferences": profile.notification_preferences
                }, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except UserProfile.DoesNotExist:
            return Response({
                "error": "Profile not found"
            }, status=status.HTTP_404_NOT_FOUND)

class VolunteerApplicationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request, ngo_id=None):
        """ Apply to become a volunteer for an NGO """
        try:
            ngo = NGO.objects.get(ngo_id=ngo_id)
            message = request.data.get('message')

            application, created = VolunteerApplication.objects.get_or_create(
                user_id=request.user_id,
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