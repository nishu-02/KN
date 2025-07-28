from django.db import models
import uuid

from ngo.models import NGO
from users.models import UserProfile

class InjuryReport(models.Model):
    """
    Comprehensive model to represent an injury report with AI analysis.
    """
    # Basic identification
    report_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user_id = models.CharField(max_length=255, help_text="ID of the user who submitted the report")
    image_url = models.URLField(max_length=500, help_text="URL of the image associated with the report")
    
    # Location data
    location = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    
    # Status and assignment
    status = models.CharField(max_length=50, default='pending', help_text="Status of the report (e.g., pending, resolved)")
    ngo_assigned = models.ForeignKey(NGO, on_delete=models.SET_NULL, null=True, related_name="reports_taken_by")
    volunteer_assigned = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name="reports_taken_by_volunteer")
    
    # AI Analysis Results - Comprehensive veterinary data
    ai_analysis = models.JSONField(help_text="Complete AI analysis results", default=dict)
    
    # Basic animal information
    title = models.CharField(max_length=500, blank=True, help_text="AI-generated descriptive title")
    description = models.TextField(blank=True, help_text="Detailed description of the animal's condition")
    species = models.CharField(max_length=100, blank=True, help_text="Animal species (e.g., Canine, Feline)")
    breed = models.CharField(max_length=100, blank=True, help_text="Breed or breed mix")
    age = models.CharField(max_length=100, blank=True, help_text="Age estimate with reasoning")
    gender = models.CharField(max_length=20, blank=True, help_text="Male/Female/Unknown")
    weight = models.CharField(max_length=100, blank=True, help_text="Weight estimate")
    
    # Health assessment
    severity = models.CharField(max_length=50, blank=True, help_text="Critical/High/Moderate/Low")
    injury_summary = models.TextField(blank=True, help_text="Detailed injury description")
    symptoms = models.JSONField(default=list, help_text="List of visible symptoms")
    urgency = models.CharField(max_length=50, blank=True, help_text="Medical priority level")
    behavior = models.CharField(max_length=200, blank=True, help_text="Observed behavior")
    context = models.CharField(max_length=100, blank=True, help_text="Situation assessment")
    
    # AI confidence and scoring
    confidence_score = models.IntegerField(null=True, blank=True, help_text="Overall analysis confidence 1-10")
    
    # Care recommendations
    care_tips = models.JSONField(default=list, help_text="AI-generated care recommendations")
    immediate_actions = models.JSONField(default=list, help_text="Immediate action steps")
    environment_factors = models.TextField(blank=True, help_text="Environmental conditions affecting the animal")
    
    # Legacy field for backward compatibility
    report_data = models.JSONField(help_text="Legacy field - original AI response", default=dict)
    
    # Timestamps
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
    
    @property
    def severity_progress(self):
        """Convert severity score to progress value (0.0 to 1.0)"""
        return (self.severity_score / 10.0) if self.severity_score else 0.5
    
    @property
    def urgency_progress(self):
        """Convert urgency score to progress value (0.0 to 1.0)"""
        return (self.urgency_score / 10.0) if self.urgency_score else 0.5
    
    @property
    def behavior_progress(self):
        """Convert behavior score to progress value (0.0 to 1.0)"""
        return (self.behavior_score / 10.0) if self.behavior_score else 0.5
    
    @property
    def age_progress(self):
        """Convert age score to progress value (0.0 to 1.0)"""
        return (self.age_score / 10.0) if self.age_score else 0.5
    
    @property
    def ai_confidence_progress(self):
        """Convert confidence score to progress value (0.0 to 1.0)"""
        return (self.confidence_score / 10.0) if self.confidence_score else 0.5

class ExpoPushToken(models.Model):
    user_id = models.CharField(max_length=255, unique=True)
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Push token for {self.user_id}"

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
