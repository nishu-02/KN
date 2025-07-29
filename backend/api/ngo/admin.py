from django.contrib import admin
from django.utils.html import format_html
from .models import NGO

@admin.register(NGO)
class NGOAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'category', 'verified', 'appwrite_user_id', 'created_at']
    list_filter = ['category', 'verified', 'created_at']
    search_fields = ['name', 'email', 'appwrite_user_id']
    readonly_fields = ['appwrite_user_id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('appwrite_user_id', 'name', 'email', 'phone')
        }),
        ('Organization Details', {
            'fields': ('category', 'description', 'website', 'verified', 'requirements')
        }),
        ('Location', {
            'fields': ('latitude', 'longitude')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    actions = ['verify_ngos', 'unverify_ngos']
    
    def verify_ngos(self, request, queryset):
        queryset.update(verified=True)
        self.message_user(request, f"{queryset.count()} NGOs verified successfully.")
    verify_ngos.short_description = "Verify selected NGOs"
    
    def unverify_ngos(self, request, queryset):
        queryset.update(verified=False)
        self.message_user(request, f"{queryset.count()} NGOs unverified.")
    unverify_ngos.short_description = "Unverify selected NGOs"
