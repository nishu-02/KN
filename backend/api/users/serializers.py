# user/serializers.py
from rest_framework import serializers
from .models import UserProfile, VolunteerApplication
from ngo.models import NGO
from ngo.serializers import NGORegisterSerializer

class VolunteerApplicationSerializer(serializers.ModelSerializer):
    """
    Production-grade serializer for VolunteerApplication supporting both read and write operations.
    - On read: returns nested NGO info.
    - On write: accepts ngo_id, validates user/ngo, and message length.
    """
    ngo = NGORegisterSerializer(read_only=True)
    ngo_id = serializers.PrimaryKeyRelatedField(
        queryset=NGO.objects.all(),
        source='ngo',
        write_only=True,
        required=True,
        error_messages={
            'required': 'NGO ID is required',
            'does_not_exist': 'NGO with this ID does not exist.'
        }
    )
    status = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = VolunteerApplication
        fields = [
            'id', 'user_id', 'ngo', 'ngo_id', 'message', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at', 'ngo']

    def validate_user_id(self, value):
        # Optionally, check user_id format or existence if needed
        if not value or not isinstance(value, str):
            raise serializers.ValidationError('User ID is required and must be a string.')
        return value

    def validate_message(self, value):
        if value and len(value) > 1000:
            raise serializers.ValidationError('Message cannot exceed 1000 characters.')
        return value

    def validate(self, data):
        # Prevent duplicate applications (enforced at DB, but check here for UX)
        user_id = data.get('user_id') or getattr(self.context.get('request', None), 'user_id', None)
        ngo = data.get('ngo')
        if user_id and ngo:
            if VolunteerApplication.objects.filter(user_id=user_id, ngo=ngo).exists():
                raise serializers.ValidationError('You have already applied to this NGO.')
        return data
from utils.validators import (
    validate_name, validate_coordinates, validate_appwrite_url,
    validate_message_length
)

class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        max_length=100,
        validators=[validate_name],
        error_messages={
            'blank': 'Name is required',
            'max_length': 'Name cannot exceed 100 characters'
        }
    )
    
    email = serializers.EmailField(
        error_messages={
            'invalid': 'Please enter a valid email address',
            'blank': 'Email is required'
        }
    )
    
    latitude = serializers.FloatField(
        required=False,
        error_messages={
            'invalid': 'Latitude must be a valid number'
        }
    )
    
    longitude = serializers.FloatField(
        required=False,
        error_messages={
            'invalid': 'Longitude must be a valid number'
        }
    )
    
    bio = serializers.CharField(
        max_length=500,
        required=False,
        allow_blank=True,
        error_messages={
            'max_length': 'Bio cannot exceed 500 characters'
        }
    )
    
    avatar_url = serializers.URLField(
        required=False,
        allow_blank=True,
        validators=[validate_appwrite_url],
        error_messages={
            'invalid': 'Please enter a valid URL'
        }
    )
    
    class Meta:
        model = UserProfile
        fields = [
            'appwrite_user_id', 'name', 'email', 'is_volunteer',
            'latitude', 'longitude', 'bio', 'avatar_url', 
            'notification_preferences', 'created_at', 'updated_at'
        ]
        read_only_fields = ['appwrite_user_id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Custom validation for coordinate pairs"""
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        # If one coordinate is provided, both must be provided
        if (latitude is not None and longitude is None) or (longitude is not None and latitude is None):
            raise serializers.ValidationError("Both latitude and longitude must be provided together")
        
        # Validate coordinates if both are provided
        if latitude is not None and longitude is not None:
            try:
                validate_coordinates(latitude, longitude)
            except Exception as e:
                raise serializers.ValidationError(str(e))
        
        return data

class NotificationPreferencesSerializer(serializers.Serializer):
    injury_reports = serializers.BooleanField(default=True)
    volunteer_updates = serializers.BooleanField(default=True)
    emergency_alerts = serializers.BooleanField(default=True)
    general = serializers.BooleanField(default=True)
    digest_frequency = serializers.ChoiceField(
        choices=[('immediate', 'Immediate'), ('daily', 'Daily'), ('weekly', 'Weekly')],
        default='immediate',
        error_messages={
            'invalid_choice': 'Please select a valid digest frequency'
        }
    )