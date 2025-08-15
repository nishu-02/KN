import uuid
from django.db import models
from django.utils import timezone
from reports.models import InjuryReport

class NotificationHistory(models.Model):
    NOTIFICATION_TYPES = [
        ('emergency', 'Emergency Alert'),
        ('status_update', 'Status Update'),
        ('injury_report', 'Injury Report'),
        ('general', 'General Announcement'),
        ('volunteer', 'Volunteer Notification'),
    ]
    
    RECIPIENT_TYPES = [
        ('user', 'User'),
        ('ngo', 'NGO'),
        ('volunteer', 'Volunteer'),
    ]

    notification_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report = models.ForeignKey(InjuryReport, on_delete=models.CASCADE, related_name="notifications", null=True, blank=True)

    recipient_id = models.CharField(max_length=255)  # Appwrite user ID
    recipient_type = models.CharField(max_length=10, choices=RECIPIENT_TYPES)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='general')

    title = models.CharField(max_length=255)
    body = models.TextField()
    data = models.JSONField(blank=True, null=True)

    status = models.CharField(max_length=20, default='sent')
    is_read = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    
    # Delivery tracking
    sent_at = models.DateTimeField(default=timezone.now)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient_id', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['is_urgent']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.notification_type} notification to {self.recipient_id}"