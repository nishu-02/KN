import base64
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import (
    InjuryReport,
    ExpoPushToken,
)
from ngo.models import NGO
from .services.gemini_client import analyze_animal_injury
from .serializers import InjuryReportSerializer

from reports.permissions import IsAppwriteUser
from .services.appwrite_service import create_appwrite_report
from reports.services.appwrite_service import create_appwrite_notification, upload_image_to_appwrite, get_image_url
from reports.services.geo import get_nearby_ngos, get_nearby_reports

from .notification import notify_user

import io

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
            # Parse location if it's a JSON string
            if isinstance(location, str):
                try:
                    import json
                    location = json.loads(location)
                except Exception:
                    return Response({"error": "Invalid location format"}, status=status.HTTP_400_BAD_REQUEST)

            if not image_file or not user_id or not location:
                return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Encode image to base64
            image_bytes = image_file.read()
            base64_image = base64.b64encode(image_bytes).decode('utf-8')

            # Analyze the image using Gemini AI
            ai_response = analyze_animal_injury(base64_image)

            if not ai_response.get('success'):
                return Response({"error": ai_response.get('error')}, status=status.HTTP_502_BAD_GATEWAY)

            # Reset a stream using already-read bytes
            file_like_object = io.BytesIO(image_bytes)
            file_like_object.name = image_file.name  # Appwrite needs filename

            file_id = upload_image_to_appwrite(file_like_object)
            # Upload image to Appwrite
            # file_id = upload_image_to_appwrite(image_file)
            image_url = get_image_url(file_id)

            # Extract latitude and longitude from location
            lat = location.get('latitude') if isinstance(location, dict) else None
            lon = location.get('longitude') if isinstance(location, dict) else None
            if lat is None or lon is None:
                return Response({"error": "Location must include latitude and longitude"}, status=status.HTTP_400_BAD_REQUEST)

            # Saving to DB
            report = InjuryReport.objects.create(
                report_id=uuid.uuid4(),
                user_id=user_id,
                image_url=image_url,
                location=str(location),
                latitude=lat,
                longitude=lon,
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

            send_push_notification(
                ngo_device_token,
                title="New Report Assigned",
                body="A new injury report has been assigned to you!"
            )

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
        allowed_statuses = ['in_progress', 'resolved']

        if new_status not in allowed_statuses:
            return Response({"error": "Invalid status provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            report = InjuryReport.objects.get(report_id=report_id)

            if report.ngo_assigned_id != request.user_id:
                return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

            # Check if already resolved
            if report.status == 'resolved':
                return Response({"message": "Report already resolved"}, status=status.HTTP_200_OK)

            report.status = new_status
            report.save()

            # Update Appwrite notification status
            update_notification_status(report_id, request.user_id, new_status)

            # Send push notification to user
            title = "Report Status Updated"
            if new_status == "in_progress":
                body = "Your report is now being looked into by the NGO."
            else:  # resolved
                body = "Your report has been marked as resolved. Thank you for your support!"

            notify_user(report.user_id, title, body)

            return Response({
                "message": f"Report marked as {new_status}"
            }, status=status.HTTP_200_OK)

        except InjuryReport.DoesNotExist:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)

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

class SavePushTokenView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        token = request.data.get('token')
        if not user_id or not token:
            return Response({
                "error": "Missing fields"
            }, status=status.HTTP_400_BAD_REQUEST)

        ExpoPushToken.objects.update_or_create(user_id=user_id, default={
            "token": token
        })
        
        return Response({
            "message": "Token saved"
        }, status=status.HTTP_200_OK)

