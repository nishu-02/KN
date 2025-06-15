from rest_framework import serializers
from .models import NGO

class NGORegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = NGO
        fields = [
            'ngo_id', 'name', 'email', 'phone',
            'latitude', 'longitude', 'category',
            'description', 'website'
        ]
        extra_kwargs = {
            'ngo_id':{
                'read_only':True
            },
        }