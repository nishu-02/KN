import base64
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import InjuryReport
from ngo.models import NGO
from .services.gemini_client import analyze_animal_injury
from .serializers import InjuryReportSerializer

from reports.permissions import IsAppwriteUser
from .services.appwrite_service import create_appwrite_report
from reports.services.appwrite_service import create_appwrite_notification
from reports.services.geo import get_nearby_ngos

class InjuryReportUploadView(APIView):
    permission_classes = [IsAppwriteUser]
    """
    API view to handle injury report submissions.
    """
    def post(self, request):
        try:
            image_file = request.FILES.get('image')
            user_id = request.data.get('user_id')
            location = request.data.get('location')

            if not image_file or not user_id or not location:
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Encode image to base64
            image_bytes = image_file.read()
            base64_image = base64.b64encode(image_bytes).decode('utf-8')

            # Analyze the image using Gemini AI
            ai_response = analyze_animal_injury(base64_image)

            if not ai_response.get('success'):
                return Response({"error": ai_response.get('error')}, status=status.HTTP_502_BAD_GATEWAY)

            # Saving to DB
            report = InjuryReport.objects.create(
                report_id=uuid.uuid4(),
                user_id=user_id,
                image_url="",
                location=location,
                report_data=ai_response.get('result'),
            )

            create_appwrite_report(report) # Saving to the database

            lat = location.get('latitude')
            lon = location.get('longitude')

            nearby_ngos = get_nearby_ngos(lat, lon, radius_km=5)
            
            for ngo in nearby_ngos:
                create_appwrite_notification({
                    "notification_id": str(uuid.uuid4()),
                    "report_id": str(report.report_id),
                    "ngo_id": ngo.ngo_id,
                    "status": "pending",
                    "created_at": str(report.created_at),
                })

            serializer = InjuryReportSerializer(report)

            return Response({
                "message": "Injury report generated successfully",
                "report": serializer.data,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            

