from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.throttling import UserRateThrottle
from django.db import transaction

from reports.models import InjuryReport
from users.models import UserProfile, VolunteerApplication
from ngo.models import NGO
from reports.serializers import InjuryReportSerializer
from users.serializers import UserProfileSerializer, NotificationPreferencesSerializer
# Remove unused import
from .services.avatar_service import AvatarService
from utils.logger import (
    user_logger, log_api_request, log_user_activity, 
    log_error_with_context
)

# Custom throttle classes
class VolunteerApplicationThrottle(UserRateThrottle):
    rate = '5/day'

class ProfileUpdateThrottle(UserRateThrottle):
    rate = '20/day'

class AvatarThrottle(UserRateThrottle):
    rate = '10/day'

class UserReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='own')
    @log_api_request(user_logger)
    def own(self, request):
        """ Get reports by the current user """
        try:
            user_id = request.user_id
            reports = InjuryReport.objects.filter(user_id=user_id)
            serializer = InjuryReportSerializer(reports, many=True)
            
            user_logger.info(f"User reports query: user_id={user_id}, found={len(reports)} reports")
            return Response(serializer.data)
        except Exception as e:
            log_error_with_context(user_logger, e, {
                'action': 'get_user_reports',
                'user_id': request.user_id
            })
            raise

    @action(detail=False, methods=['get'], url_path='helped')
    @log_api_request(user_logger)
    def helped(self, request):
        """ Get Reports where the user served as a volunteer """
        try:
            user_id = request.user_id
            try:
                profile = UserProfile.objects.get(appwrite_user_id=user_id)
            except UserProfile.DoesNotExist:
                user_logger.warning(f"User profile not found for volunteer reports: user_id={user_id}")
                return Response([], status=status.HTTP_200_OK)
            
            reports = InjuryReport.objects.filter(volunteer_assigned=profile)
            serializer = InjuryReportSerializer(reports, many=True)
            
            user_logger.info(f"Volunteer reports query: user_id={user_id}, found={len(reports)} reports")
            return Response(serializer.data)
        except Exception as e:
            log_error_with_context(user_logger, e, {
                'action': 'get_volunteer_reports',
                'user_id': request.user_id
            })
            raise

class UserProfileViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @action(detail=False, methods=['get'], url_path='onboarding-status')
    @log_api_request(user_logger)
    def onboarding_status(self, request):
        """ Check if user needs onboarding """
        try:
            user_id = request.user_id
            
            # Check if profile exists
            profile_exists = UserProfile.objects.filter(appwrite_user_id=user_id).exists()
            ngo_exists = NGO.objects.filter(appwrite_user_id=user_id).exists()
            
            if profile_exists or ngo_exists:
                return Response({
                    "onboarding_required": False,
                    "account_type": "ngo" if ngo_exists else "user",
                    "profile_complete": True
                })
            else:
                return Response({
                    "onboarding_required": True,
                    "account_type": "unknown",
                    "profile_complete": False,
                    "onboarding_url": "/users/profile/onboard/"
                })
                
        except Exception as e:
            log_error_with_context(user_logger, e, {
                'action': 'onboarding_status',
                'user_id': request.user_id
            })
            return Response({
                "error": "Failed to check onboarding status"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='whoami')
    @log_api_request(user_logger)
    def whoami(self, request):
        """ Determine account type - returns 'user', 'ngo', or 'unknown' """
        try:
            user_id = request.user_id
            
            # Check if it's an NGO
            try:
                ngo = NGO.objects.get(appwrite_user_id=user_id)
                user_logger.info(f"Account type determined: NGO - user_id={user_id}")
                return Response({
                    "account_type": "ngo",
                    "entity_id": str(ngo.id),
                    "name": ngo.name,
                    "email": ngo.email
                })
            except NGO.DoesNotExist:
                pass
            
            # Check if it's a regular user
            try:
                user_profile = UserProfile.objects.get(appwrite_user_id=user_id)
                user_logger.info(f"Account type determined: User - user_id={user_id}")
                return Response({
                    "account_type": "user",
                    "entity_id": str(user_profile.id),
                    "name": user_profile.name,
                    "email": user_profile.email,
                    "is_volunteer": user_profile.is_volunteer
                })
            except UserProfile.DoesNotExist:
                pass
            
            # Unknown account type
            user_logger.warning(f"Unknown account type: user_id={user_id}")
            return Response({
                "account_type": "unknown",
                "error": "Account not found in database"
            }, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            log_error_with_context(user_logger, e, {
                'action': 'whoami',
                'user_id': request.user_id
            })
            return Response({
                "error": "Failed to determine account type"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='me')
    @log_api_request(user_logger)
    def get_profile(self, request):
        """ Get current user's profile """
        try:
            profile = UserProfile.objects.get(appwrite_user_id=request.user_id)
            serializer = UserProfileSerializer(profile)
            
            user_logger.info(f"Profile retrieved: user_id={request.user_id}")
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            user_logger.warning(f"Profile not found: user_id={request.user_id}")
            return Response({
                "error": "Profile not found",
                "requires_onboarding": True,
                "onboarding_url": "/users/profile/onboard/"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            log_error_with_context(user_logger, e, {
                'action': 'get_profile',
                'user_id': request.user_id
            })
            raise

    @action(detail=False, methods=['post'], url_path='onboard')
    @log_api_request(user_logger)
    def onboard_user(self, request):
        """ Complete user onboarding - create profile for authenticated user """
        try:
            # Check if profile already exists
            if UserProfile.objects.filter(appwrite_user_id=request.user_id).exists():
                return Response({
                    "error": "Profile already exists",
                    "action": "redirect_to_profile"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user data from request
            name = request.data.get('name', f"User {request.user_id[:8]}")
            email = request.data.get('email', f"user_{request.user_id}@example.com")
            is_volunteer = request.data.get('is_volunteer', True)
            bio = request.data.get('bio', '')
            location_data = request.data.get('location', {})
            
            # Create the profile atomically
            with transaction.atomic():
                profile = UserProfile.objects.create(
                    appwrite_user_id=request.user_id,
                    name=name,
                    email=email,
                    is_volunteer=is_volunteer,
                    bio=bio,
                    latitude=location_data.get('latitude'),
                    longitude=location_data.get('longitude'),
                    notification_preferences={
                        'email_notifications': True,
                        'push_notifications': True,
                        'emergency_alerts': True
                    }
                )
            
            user_logger.info(f"User onboarding completed: user_id={request.user_id}, profile_id={profile.id}")
            
            # Log the onboarding activity
            log_user_activity(request.user_id, 'onboarding_completed', {
                'profile_id': profile.id,
                'is_volunteer': is_volunteer
            })
            
            # Return the created profile
            serializer = UserProfileSerializer(profile)
            return Response({
                "message": "Onboarding completed successfully",
                "profile": serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            log_error_with_context(user_logger, e, {
                'action': 'onboard_user',
                'user_id': request.user_id
            })
            return Response({
                "error": "Onboarding failed",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['patch'], url_path='update')
    @log_api_request(user_logger)
    def update_profile(self, request):
        """ Update user profile """
        self.throttle_classes = [ProfileUpdateThrottle]
        try:
            profile = UserProfile.objects.get(appwrite_user_id=request.user_id)
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                
                log_user_activity(request.user_id, 'profile_updated', {
                    'updated_fields': list(request.data.keys())
                })
                return Response(serializer.data)
            else:
                user_logger.warning(f"Profile update validation failed: user_id={request.user_id}, errors={serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except UserProfile.DoesNotExist:
            user_logger.warning(f"Profile not found for update: user_id={request.user_id}")
            return Response({
                "error": "Profile not found"
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['patch'], url_path='toggle-volunteer')
    @log_api_request(user_logger)
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
            old_status = profile.is_volunteer
            profile.is_volunteer = is_volunteer
            profile.save()
            
            log_user_activity(user_id, 'volunteer_status_toggled', {
                'old_status': old_status,
                'new_status': is_volunteer
            })
        
            return Response({
                "is_volunteer": profile.is_volunteer
            }, status=status.HTTP_200_OK)
        except Exception as e:
            log_error_with_context(user_logger, e, {
                'action': 'toggle_volunteer',
                'user_id': user_id,
                'is_volunteer': is_volunteer
            })
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='register-device')
    @log_api_request(user_logger)
    def register_device(self, request):
        """Register or update a push token for the authenticated user"""
        try:
            user_id = request.user_id
            token = request.data.get('token')
            platform = request.data.get('platform')
            device_id = request.data.get('deviceId')

            if not token:
                return Response({'error': 'token is required'}, status=status.HTTP_400_BAD_REQUEST)

            profile = UserProfile.objects.get(appwrite_user_id=user_id)

            # Upsert UserPushToken
            obj, created = UserPushToken.objects.update_or_create(
                user=profile,
                token=token,
                defaults={
                    'appwrite_user_id': user_id,
                    'device_id': device_id,
                    'platform': platform,
                    'is_active': True
                }
            )

            # Subscribe to volunteer topic if applicable
            try:
                from .services.push_service import subscribe_token_to_topic
                if profile.is_volunteer:
                    subscribe_token_to_topic(token, 'volunteer')
            except Exception as e:
                user_logger.warning(f"Failed to subscribe token to topic: {e}")

            user_logger.info(f"Registered push token for user {user_id}")
            return Response({'ok': True, 'created': created})

        except UserProfile.DoesNotExist:
            return Response({'error': 'profile not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            log_error_with_context(user_logger, e, {'action': 'register_device', 'user_id': request.user_id})
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='upload-avatar')
    @log_api_request(user_logger)
    def upload_avatar(self, request):
        """ Upload user avatar """
        self.throttle_classes = [AvatarThrottle]
        try:
            image_file = request.FILES.get('avatar')
            user_id = request.user_id
            
            if not image_file:
                return Response({
                    "error": "Avatar image is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Enhanced validation using our validators
            from utils.validators import validate_file_size, validate_image_file
            
            try:
                validate_file_size(image_file, max_size_mb=5)
                validate_image_file(image_file)
            except Exception as e:
                return Response({
                    "error": str(e)
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
            
            log_user_activity(user_id, 'avatar_uploaded', {
                'file_size': image_file.size,
                'file_name': image_file.name
            })
            
            return Response({
                "message": "Avatar uploaded successfully",
                "avatar_url": avatar_url
            }, status=status.HTTP_200_OK)
            
        except UserProfile.DoesNotExist:
            user_logger.warning(f"User profile not found for avatar upload: user_id={user_id}")
            return Response({
                "error": "User profile not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            log_error_with_context(user_logger, e, {
                'action': 'upload_avatar',
                'user_id': user_id,
                'file_size': image_file.size if 'image_file' in locals() else None
            })
            return Response({
                "error": f"Upload failed: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['delete'], url_path='remove-avatar')
    @log_api_request(user_logger)
    def remove_avatar(self, request):
        """ Remove user avatar """
        self.throttle_classes = [AvatarThrottle]
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
            
            log_user_activity(user_id, 'avatar_removed')
            
            return Response({
                "message": "Avatar removed successfully"
            }, status=status.HTTP_200_OK)
            
        except UserProfile.DoesNotExist:
            user_logger.warning(f"User profile not found for avatar removal: user_id={user_id}")
            return Response({
                "error": "User profile not found"
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post', 'patch'], url_path='notification-preferences')
    @log_api_request(user_logger)
    def update_notification_preferences(self, request):
        """ Update notification preferences """
        try:
            profile = UserProfile.objects.get(appwrite_user_id=request.user_id)
            serializer = NotificationPreferencesSerializer(data=request.data)
            
            if serializer.is_valid():
                profile.notification_preferences = serializer.validated_data
                profile.save()
                
                log_user_activity(request.user_id, 'notification_preferences_updated', {
                    'preferences': serializer.validated_data
                })
                
                return Response({
                    "message": "Notification preferences updated",
                    "preferences": profile.notification_preferences
                }, status=status.HTTP_200_OK)
            else:
                user_logger.warning(f"Notification preferences validation failed: user_id={request.user_id}, errors={serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except UserProfile.DoesNotExist:
            user_logger.warning(f"Profile not found for notification preferences update: user_id={request.user_id}")
            return Response({
                "error": "Profile not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            log_error_with_context(user_logger, e, {
                'action': 'update_notification_preferences',
                'user_id': request.user_id
            })
            raise

class VolunteerApplicationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    throttle_classes = [VolunteerApplicationThrottle]

    @log_api_request(user_logger)
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
            
            # Note: Volunteer application notification removed as part of cleanup
            
            log_user_activity(request.user_id, 'volunteer_application_submitted', {
                'ngo_id': ngo_id,
                'message': message
            })
            
            return Response({
                "message": "Application submitted successfully",
            }, status=status.HTTP_201_CREATED)
        
        except NGO.DoesNotExist:
            user_logger.warning(f"NGO not found for volunteer application: ngo_id={ngo_id}, user_id={request.user_id}")
            return Response({
                "error": "NGO not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            log_error_with_context(user_logger, e, {
                'action': 'create_volunteer_application',
                'user_id': request.user_id,
                'ngo_id': ngo_id
            })
            raise