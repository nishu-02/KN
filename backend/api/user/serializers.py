# user/serializers.py
from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'appwrite_user_id', 'name', 'email', 'is_volunteer',
            'latitude', 'longitude', 'bio', 'avatar_url', 
            'notification_preferences', 'created_at', 'updated_at'
        ]
        read_only_fields = ['appwrite_user_id', 'created_at', 'updated_at']

class NotificationPreferencesSerializer(serializers.Serializer):
    injury_reports = serializers.BooleanField(default=True)
    volunteer_updates = serializers.BooleanField(default=True)
    emergency_alerts = serializers.BooleanField(default=True)
    general = serializers.BooleanField(default=True)
    digest_frequency = serializers.ChoiceField(
        choices=[('immediate', 'Immediate'), ('daily', 'Daily'), ('weekly', 'Weekly')],
        default='immediate'
    )