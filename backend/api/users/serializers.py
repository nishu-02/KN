# user/serializers.py
from rest_framework import serializers
from .models import UserProfile
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