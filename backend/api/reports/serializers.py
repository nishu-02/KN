from rest_framework import serializers
from .models import InjuryReport

class InjuryReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = InjuryReport
        fields = ['report_id', 'user_id', 'image_url', 'report_data', 'location', 'created_at']
