from django.db import models
import uuid

from ngo.models import NGO
from volunteers.models import Volunteer

class InjuryReport(models.Model):
    """
    Model to represent an injury report.
    """
    report_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user_id = models.CharField(max_length=255, help_text="ID of the user who submitted the report")
    image_url = models.URLField(max_length=500, help_text="URL of the image associated with the report")
    report_data = models.JSONField(help_text="JSON data containing details of the report")
    location = models.CharField(max_length=255)
    status = models.CharField(max_length=50, default='pending', help_text="Status of the report (e.g., pending, resolved)")
    created_at = models.DateTimeField(auto_now_add=True)

    latitude = models.FloatField()
    longitude = models.FloatField()

    ngo_assigned = models.ForeignKey(NGO, on_delete=models.SET_NULL, null=True, related_name="reports_taken_by")
    ngo = models.ForeignKey(NGO, on_delete=models.SET_NULL, null=True, related_name="reports_created_by")
   
    volunteer_assigned = models.ForeignKey(Volunteer, on_delete=models.SET_NULL, null=True, blank=True, related_name="reports_taken_by_volunteer")
    
    def __str__(self):
        return f"Report {self.id} - {self.status}"

class ExpoPushToken(models.Model):
    user_id = models.CharField(max_length=255, unique=True)
    token = models.CharField(max_length=255)

class ReportStatusHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report = models.ForeignKey('InjuryReport', on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.report.report_id} - {self.status} at {self.updated_at}"
