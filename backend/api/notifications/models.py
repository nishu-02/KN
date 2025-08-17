from django.db import models
import uuid


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('emergency', 'Emergency Alert'),
        ('status_update', 'Status Update'),
        ('injury_report', 'Injury Report'),
        ('general', 'General Announcement'),
        ('volunteer', 'Volunteer Application'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient_user_id = models.CharField(max_length=255)  # Appwrite user ID
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    body = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient_user_id', '-created_at']),
            models.Index(fields=['type']),
            models.Index(fields=['is_read']),
        ]

    def __str__(self):
        return f"{self.title} - {self.recipient_user_id}"


class NotificationPreferences(models.Model):
    user_id = models.CharField(max_length=255, unique=True)  # Appwrite user ID
    emergency_alerts = models.BooleanField(default=True)  # Always true for safety
    status_updates = models.BooleanField(default=True)
    general_announcements = models.BooleanField(default=True)
    injury_reports = models.BooleanField(default=True)  # For volunteers/NGOs
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences for {self.user_id}"
