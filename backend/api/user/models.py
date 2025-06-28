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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name or self.appwrite_user_id

class VolunteerApplcation(models.Model):
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
