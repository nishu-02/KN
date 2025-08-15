from django.db import models
import uuid
from ngo.models import NGO
from users.models import UserProfile

class InjuryReport(models.Model):
    report_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user_id = models.CharField(max_length=255)
    image_url = models.URLField(max_length=500)

    location = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()

    status = models.CharField(max_length=50, default='pending')
    ngo_assigned = models.ForeignKey(NGO, on_delete=models.SET_NULL, null=True, related_name="reports_taken_by")
    volunteer_assigned = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name="reports_taken_by_volunteer")

    ai_analysis = models.JSONField(default=dict)

    # AI-extracted fields
    title = models.CharField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    species = models.CharField(max_length=100, blank=True)
    breed = models.CharField(max_length=100, blank=True)
    age = models.CharField(max_length=100, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    weight = models.CharField(max_length=100, blank=True)

    severity = models.CharField(max_length=50, blank=True)
    injury_summary = models.TextField(blank=True)
    symptoms = models.JSONField(default=list)
    urgency = models.CharField(max_length=50, blank=True)
    behavior = models.CharField(max_length=200, blank=True)
    context = models.CharField(max_length=100, blank=True)

    confidence_score = models.IntegerField(null=True, blank=True)
    care_tips = models.JSONField(default=list)
    immediate_actions = models.JSONField(default=list)
    environment_factors = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['severity']),
            models.Index(fields=['urgency']),
            models.Index(fields=['created_at']),
            models.Index(fields=['latitude', 'longitude']),
        ]

    def __str__(self):
        return f"Report {self.report_id} - {self.title or 'Untitled'} - {self.status}"

class ReportStatusHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report = models.ForeignKey('InjuryReport', on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20)
    updated_at = models.DateTimeField(auto_now_add=True)
    updated_by = models.CharField(max_length=255, blank=True, help_text="User who updated the status")
    notes = models.TextField(blank=True, help_text="Additional notes about the status change")

    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.report.report_id} - {self.status} at {self.updated_at}"
