from rest_framework import serializers
from .models import InjuryReport, ExpoPushToken, ReportStatusHistory

class InjuryReportSerializer(serializers.ModelSerializer):
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
            'care_tips', 'immediate_actions', 'environment_factors',
            'ai_analysis',
        ]
        read_only_fields = ['report_id', 'created_at', 'updated_at']


class InjuryReportCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating injury reports.
    """

    class Meta:
        model = InjuryReport
        fields = [
            'user_id', 'image_url', 'location', 'latitude', 'longitude',
            'title', 'description', 'species', 'breed', 'age', 'gender', 'weight',
            'severity', 'injury_summary', 'symptoms', 'urgency', 'behavior', 'context',
            'confidence_score', 'care_tips', 'immediate_actions', 'environment_factors',
            'vital_signs', 'ai_analysis',
        ]

class ExpoPushTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpoPushToken
        fields = ['user_id', 'token', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class ReportStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportStatusHistory
        fields = ['id', 'report', 'status', 'updated_at', 'updated_by', 'notes']
        read_only_fields = ['id', 'updated_at']
