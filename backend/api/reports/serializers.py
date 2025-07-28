from rest_framework import serializers
from .models import InjuryReport, ExpoPushToken, ReportStatusHistory
import json

class InjuryReportSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for injury reports with AI analysis data.
    """
    # Related field display names
    ngo_name = serializers.CharField(source='ngo_assigned.name', read_only=True)
    volunteer_name = serializers.CharField(source='volunteer_assigned.name', read_only=True)
    
    class Meta:
        model = InjuryReport
        fields = [
            'report_id', 'user_id', 'image_url', 'status', 'created_at', 'updated_at',
            'location', 'latitude', 'longitude',
            'ngo_assigned', 'volunteer_assigned', 'ngo_name', 'volunteer_name',
            'title', 'description', 'species', 'breed', 'age', 'gender', 'weight',
            'severity', 'injury_summary', 'symptoms', 'urgency', 'behavior', 'context',
            'confidence_score',
            'ai_analysis', 'report_data'
        ]
        read_only_fields = ['report_id', 'created_at', 'updated_at']
    
class InjuryReportCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating injury reports with AI analysis.
    """
    class Meta:
        model = InjuryReport
        fields = [
            'user_id', 'image_url', 'location', 'latitude', 'longitude',
            'title', 'description', 'species', 'breed', 'age', 'gender', 'weight',
            'severity', 'injury_summary', 'symptoms', 'urgency', 'behavior', 'context',
            'confidence_score', 'ai_analysis'
        ]
    
class ExpoPushTokenSerializer(serializers.ModelSerializer):
    """
    Serializer for push notification tokens.
    """
    class Meta:
        model = ExpoPushToken
        fields = ['user_id', 'token', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class ReportStatusHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for report status history.
    """
    class Meta:
        model = ReportStatusHistory
        fields = ['id', 'report', 'status', 'updated_at', 'updated_by', 'notes']
        read_only_fields = ['id', 'updated_at']
