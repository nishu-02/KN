from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import NGO
from reports.models import InjuryReport
from .serializers import NGORegisterSerializer
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny

import appwrite
from appwrite.client import Client
from appwrite.services.account import Account
from reports.services.appwrite_service import update_notification_status
from reports.permissions import IsAppwriteUser

from django.conf import settings

class RegisterNGOView(APIView):
    permission_classes = [IsAppwriteUser]

    def post(self, request):
        user_id = request.user_id  # get from authentication

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

# View to search the NGO

class NGOSearchPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

class NGOSearchView(ListAPIView):
    queryset = NGO.objects.filter()
    serializer_class = NGORegisterSerializer
    pagination_class = NGOSearchPagination
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ['name','description', 'category', 'location']

class AcceptReportView(APIView):
    permission_classes = [IsAppwriteUser]
    
    def post(self, request, report_id):
        try:
            # Validate lat/lon in request
            lat = request.data.get('lat')
            lon = request.data.get('lon')
            
            if not lat or not lan:
                return Response({
                    "error": "Missing NGO location coordinates"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Fetch the report
            report = InjuryReport.objects.select_for_update().get(report=report_id)
            
            if report.status != 'pending':
                return Response({
                    "error": "Already Taken",
                }, status=status.HTTP_409_CONFLICT)

            # Lock it to this NGO
            report.ngo_assigned_id = request.user_id
            report.status = 'in_progress'
            report.save()

            #Updating the appwrite notification
            update_notification_status(report_id, request.user_id, 'accepted')

            #Return route info
            return Response({
                "message": "Report accepted successfully",
                "report_id": report_id,
                "route":{
                    "from": {
                        "lat": request.data['lat'],
                        "lon": request.data['lon']
                    },
                    "to": {
                        "lat": report.latitude,
                        "lon": report.longitude
                    }
                }
            }, status=status.HTTP_200_OK)

        except InjuryReport.DoesNotExist:
            return Response({
                "error": "Report not found."
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)