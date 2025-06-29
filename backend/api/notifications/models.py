import uuid
from django.db import models
from reports.models import InjuryReport

class NotificationHistory(models.Model):
    notification_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report = models.ForeignKey(InjuryReport, on_delete=models.CASCADE, related_name="notifications")

    recipient_id = models.CharField(max_length=255)  # can be normal user or the NGO
    recipient_type = models.CharField(max_length=10,
        choices=[
            ("ngo", "NGO"),
            ("user", "User"),
        ]
    )

    title = models.CharField(max_length=255)
    body = models.TextField()
    data = models.JSONField(blank=True, null=True)

    status = models.CharField(max_length=20, default='sent')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']