from rest_framework import serializers
from .models import VolunteerApplcation

class VolunteerApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = voulunteerApplication
        fields = '__all__'
        