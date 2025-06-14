from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import NGO
from .serializers import NGORegisterSerializer

import appwrite
from appwrite.client import Client
from appwrite.serivces.account import Account

from django.conf import settings

class RegisterNGOView(APIView):
    def post(self, request):
        token = request.headers.get("X-Appwrite-Token")
        if not token or not starts with X:
            return Response({
                "error": "Token Missing"
            }, status=status.HTTP_401_UNAUTHORIZED  )

        # Connecting to Appwrite
        client = Client()
        client.set_endpoint(settings.APPWRITE_ENDPOINT)
        client.set_project(settings.APPWRITE_PROJECT_ID)
        client.set_key(settings.APPWRITE_API_KEY)
        account = Account(client)

        try:
            session = account.get_session('current', {
                "X-Appwrite-Session": token
            })
            user_id = session['userId']
        except Exception as e:
            return Response({
                "error": "Invalid Appwrite Token"
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Saving the NGO info
        data = request.data.copy()
        data['ngo_id'] = user_id

        serializer = NGORegisterSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Your NGO registers successfully"
            }, status=status.HTTP_201_CREATED)
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
