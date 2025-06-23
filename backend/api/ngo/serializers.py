from rest_framework import serializers
from .models import NGO

class NGORegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = NGO
        fields = [
            'appwrite_user_id', 'name', 'email', 'phone',
            'latitude', 'longitude', 'category',
            'description', 'website'
        ]
        extra_kwargs = {
            'appwrite_user_id':{
                'read_only':True
            },
        }