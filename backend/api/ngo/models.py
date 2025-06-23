from django.db import models

class NGO(models.Model):
    CATEGORY_CHOICES = [
        ('animal', 'Animal Welfare'),
        ('environment', 'Environment'),
        ('medical', 'Medical Aid'),
        ('education', 'Education'),
        ('other', 'Other'),
    ]

    appwrite_user_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=15, blank=True, null=True)

    latitude = models.DecimalField(decimal_places=5, max_digits=9)
    longitude = models.DecimalField(decimal_places=5, max_digits=9)

    description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True)
    verified = models.BooleanField(default=False)

    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name