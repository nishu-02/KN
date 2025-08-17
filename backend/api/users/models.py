from django.db import models
from django.conf import settings
from ngo.models import NGO

class UserProfile(models.Model):
    appwrite_user_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    is_volunteer = models.BooleanField(default=True)
    latitude = models.DecimalField(decimal_places=5, max_digits=9, null=True, blank=True)
    longitude = models.DecimalField(decimal_places=5, max_digits=9, null=True, blank=True)
    
    notification_preferences = models.JSONField(default=dict, blank=True)
    avatar_url = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def get_default_notification_preferences(self):
        """Get default notification preferences"""
        return {
            'emergency_alerts': True,      # Emergency notifications (all users)
            'status_updates': True,        # Report status updates  
            'general_announcements': True, # General announcements
            'injury_reports': self.is_volunteer  # Only for volunteers/NGOs
        }
    
    def save(self, *args, **kwargs):
        # Set default notification preferences if empty
        if not self.notification_preferences:
            self.notification_preferences = self.get_default_notification_preferences()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name or self.appwrite_user_id

class UserPushToken(models.Model):
    """Store user push tokens for notifications"""
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='push_tokens')
    appwrite_user_id = models.CharField(max_length=255, db_index=True)
    token = models.CharField(max_length=500, unique=True)
    device_id = models.CharField(max_length=255, blank=True, null=True)
    platform = models.CharField(max_length=10, choices=[('ios', 'iOS'), ('android', 'Android')], blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_used = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'token')
        indexes = [
            models.Index(fields=['appwrite_user_id']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"Push token for {self.user.name or self.appwrite_user_id}"


class PushToken(models.Model):
    """Generic push token storage for any user type (UserProfile or NGO)"""
    appwrite_user_id = models.CharField(max_length=255, db_index=True)
    token = models.CharField(max_length=500, unique=True)
    device_id = models.CharField(max_length=255, blank=True, null=True)
    platform = models.CharField(max_length=10, choices=[('ios', 'iOS'), ('android', 'Android')], blank=True)
    user_type = models.CharField(max_length=20, choices=[('user', 'User'), ('ngo', 'NGO')], default='user')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_used = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('appwrite_user_id', 'token')
        indexes = [
            models.Index(fields=['appwrite_user_id']),
            models.Index(fields=['is_active']),
            models.Index(fields=['user_type']),
        ]

    def __str__(self):
        return f"Push token for {self.appwrite_user_id} ({self.user_type})"


class VolunteerApplication(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    user_id = models.CharField(max_length=255)
    ngo = models.ForeignKey(NGO, on_delete=models.CASCADE, related_name='volunteer_applications')
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user_id', 'ngo') # Preventing the mutliple applications
