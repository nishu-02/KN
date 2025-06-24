import uuid
from django.db import models

class NotificationHistory(models.Model):
    id = models.UUIDField(primary=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=255) # can be normal user or the NGO
    title = models.CharField(max_length)
    body = models.TextField()
    data = models.JSONField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DataTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created-at']