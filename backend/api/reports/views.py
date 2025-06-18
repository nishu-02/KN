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
from reports.services.appwrite_service import create_appwrite_notification, upload_image_to_appwrite
from reports.services.geo import get_nearby_ngos, get_nearby_reports

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

            # Upload image to Appwrite
            file_id = upload_image_to_appwrite(image_file)
            image_url = get_image_url(file_id)

            # Saving to DB
            report = InjuryReport.objects.create(
                report_id=uuid.uuid4(),
                user_id=user_id,
                image_url=image_url,
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

class UpdateReportStatusView(APIView):
    permission_classes = [IsAppwriteUser]

    def patch(self, request, report_id):
        new_status = request.data.get('status')
        allowed_statuses = [
            'in_progress',
            'resolved'
        ]      

        if new_status not in allowed_statuses:
            return Response({
                "error": "not a valid selection"
            }, status=400)

        try:
            report = InjuryReport.objects.get(report_id=report_id)

            if report.ngo_assigned_id != request.user_id:
                return Response({
                    "error": "Unauthorized"
                }, status=status.HTTP_403_FORBIDDEN)

            report.status = new_status
            report.save()

            update_notification_status(report_id, request.user_id, new_status)

            return Response({
                "message": "Report status updated!"
            }, status=status.HTTP_200_OK)
        except InjuryReport.DoesNotExist:
            return Response({
                "error": "Report not found"
            }, status=status.HTTP_404_NOT_FOUND)

class NearbyReportsView(APIView):
    permission_classes = [IsAppwriteUser]

    def get(self, request):
        lat = float(request.query_params.get('lat'))
        lon = float(request.query_params.get('lon'))

        nearby_reports = get_nearby_reports(lat, lon, radius_km=5)
        serializer = InjuryReportSerializer(nearby_reports, many=True)
        return Response(serializer.data)

class NGOSpecificReportsView(APIView):
    permission_classes = [IsAppwriteUser]

    def get(self, request):
        user_id = request.user_id
        reports = InjuryReport.objects.filter(ngo_assigned_id=user_id)
        serializer = InjuryReportSerializer(reports, many=True)
        return Response(serializer.data)

class ResolveReportView(APIView):
    permission_classes = [IsAppwriteUser]

    def post(self, request, report_id):
        try:
            report = InjuryReport.objects.get(report_id=report_id)

            # Check if the requester is the assigned NGO
            if report.ngo_assigned_id != request.user_id:
                return Response({
                    "error": "You are not authorized to resolve this report"
                }, status=status.HTTP_403_FORBIDDEN)
            
            if report.status != 'in_progress':
                return Response({
                    "error": "Only reports in progress can be resolved."
                }, status=status.HTTP_400_BAD_REQUEST)

            # Mark the report as resolved
            report.status = 'resolved'
            report.save()

            # Update the appwrite notification status
            update_notification_status(report_id, request.user_id, 'resolved')

            return Response({
                "message": "Report marked as resolved successfully"
            }, status=status.HTTP_200_OK)

        except InjuryReport.DoesNotExist:
            return Response({
                "error": "Report not found"
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)