from django.contrib import admin
from django.utils.html import format_html
from .models import UserProfile, VolunteerApplication

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'is_volunteer', 'appwrite_user_id', 'created_at']
    list_filter = ['is_volunteer', 'created_at']
    search_fields = ['name', 'email', 'appwrite_user_id']
    readonly_fields = ['appwrite_user_id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('appwrite_user_id', 'name', 'email')
        }),
        ('Profile Details', {
            'fields': ('is_volunteer', 'bio', 'avatar_url')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude')
        }),
        ('Preferences', {
            'fields': ('notification_preferences',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(VolunteerApplication)
class VolunteerApplicationAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'ngo', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user_id', 'ngo__name']
    readonly_fields = ['created_at', 'updated_at']
