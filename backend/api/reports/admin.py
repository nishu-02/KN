from django.contrib import admin
from .models import InjuryReport

@admin.register(InjuryReport)
class InjuryReportAdmin(admin.ModelAdmin):
    list_display = ('report_id', 'user_id', 'status', 'created_at')
    search_fields = ('user_id', 'status', 'location')