import base64
import uuid
import io
import json
from rest_framework import status, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import CreateAPIView
from django.db import transaction
from django.core.exceptions import ValidationError

from .models import InjuryReport, ExpoPushToken
from ngo.models import NGO
from .services.gemini_client import analyze_animal_injury
from .serializers import InjuryReportSerializer
from user.models import UserProfile
from .services.appwrite_service import create_appwrite_report
from reports.services.appwrite_service import create_appwrite_notification, upload_image_to_appwrite, get_image_url
from reports.services.geo import get_nearby_ngos, get_nearby_reports, get_nearby_volunteers
from notifications.utils import send_and_log_notification
from .notification import notify_user


class InjuryReportViewSet(viewsets.ModelViewSet):
    queryset = InjuryReport.objects.all()
    serializer_class = InjuryReportSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Custom create for injury report upload (with image, AI, notifications)"""
        try:
            # Extract data from request
            image_file = request.FILES.get('image')
            user_id = request.data.get('user_id')
            location = request.data.get('location')

            # Parse location if it's a string
            if isinstance(location, str):
                try:
                    location = json.loads(location)
                except (json.JSONDecodeError, TypeError):
                    return Response(
                        {"error": "Invalid location format. Expected JSON object."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Validate required fields
            if not image_file or not user_id or not location:
                return Response(
                    {"error": "Missing required fields: image, user_id, location"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate location coordinates
            lat = location.get('latitude') if isinstance(location, dict) else None
            lon = location.get('longitude') if isinstance(location, dict) else None

            if lat is None or lon is None:
                return Response(
                    {"error": "Location must include latitude and longitude"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate coordinate ranges
            try:
                lat = float(lat)
                lon = float(lon)
                if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                    raise ValueError("Coordinates out of range")
            except (ValueError, TypeError):
                return Response(
                    {"error": "Invalid latitude or longitude values"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Process image for AI analysis
            image_bytes = image_file.read()
            base64_image = base64.b64encode(image_bytes).decode('utf-8')

            # Analyze image with AI
            ai_response = analyze_animal_injury(base64_image)
            if not ai_response.get('success'):
                return Response(
                    {"error": f"AI analysis failed: {ai_response.get('error', 'Unknown error')}"}, 
                    status=status.HTTP_502_BAD_GATEWAY
                )

            # Upload image to storage
            file_like_object = io.BytesIO(image_bytes)
            file_like_object.name = image_file.name
            file_id = upload_image_to_appwrite(file_like_object)
            image_url = get_image_url(file_id)

            # Create report with database transaction
            with transaction.atomic():
                report = InjuryReport.objects.create(
                    report_id=uuid.uuid4(),
                    user_id=user_id,
                    image_url=image_url,
                    location=json.dumps(location),  # Store as JSON string
                    latitude=lat,
                    longitude=lon,
                    report_data=ai_response.get('result'),
                )

                # Create Appwrite report
                create_appwrite_report(report)

                # Send notifications to nearby NGOs
                nearby_ngos = get_nearby_ngos(lat, lon, radius_km=5)
                for ngo in nearby_ngos:
                    send_and_log_notification(
                        recipient_id=ngo.ngo_id,
                        recipient_type="ngo",
                        title="New Report Assigned",
                        body="A new injury report has been assigned to you!",
                        data={"report_id": str(report.report_id)},
                        report=report
                    )

                # Send notifications to nearby volunteers
                nearby_volunteers = get_nearby_volunteers(lat, lon, radius_km=5)
                for volunteer in nearby_volunteers:
                    send_and_log_notification(
                        recipient_id=volunteer.user_id,
                        recipient_type="volunteer",
                        title="New Report in Your Area!",
                        body="A new animal injury report needs your help!",
                        data={"report_id": str(report.report_id)},
                        report=report
                    )

            # Serialize and return response
            serializer = self.get_serializer(report)
            return Response({
                "message": "Injury report generated successfully",
                "report": serializer.data,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Custom action for updating report status"""
        new_status = request.data.get('status')
        allowed_statuses = ['in_progress', 'resolved']
        volunteer_id = request.data.get('volunteer_id')

        # Validate status
        if new_status not in allowed_statuses:
            return Response(
                {"error": f"Invalid status. Allowed values: {', '.join(allowed_statuses)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            report = self.get_object()

            # Check permissions
            is_ngo = (hasattr(report, 'ngo_assigned') and 
                     report.ngo_assigned and 
                     report.ngo_assigned.ngo_id == request.user.id)
            
            is_volunteer = (hasattr(report, 'volunteer_assigned') and 
                           report.volunteer_assigned and 
                           report.volunteer_assigned.appwrite_user_id == request.user.id)

            with transaction.atomic():
                if report.status == 'pending':
                    if volunteer_id:
                        # Assign volunteer
                        try:
                            volunteer = UserProfile.objects.get(
                                appwrite_user_id=volunteer_id, 
                                is_volunteer=True
                            )
                            report.volunteer_assigned = volunteer
                            report.status = new_status
                            report.save()
                            is_volunteer = True
                        except UserProfile.DoesNotExist:
                            return Response(
                                {"error": "Volunteer not found or not eligible"}, 
                                status=status.HTTP_404_NOT_FOUND
                            )
                    elif is_ngo:
                        report.status = new_status
                        report.save()
                    else:
                        return Response(
                            {"error": "Unauthorized to update this report"}, 
                            status=status.HTTP_403_FORBIDDEN
                        )
                else:
                    # Report is already in progress or resolved
                    if not (is_ngo or is_volunteer):
                        return Response(
                            {"error": "Unauthorized to update this report"}, 
                            status=status.HTTP_403_FORBIDDEN
                        )
                    
                    if report.status == 'resolved':
                        return Response(
                            {"message": "Report already resolved"}, 
                            status=status.HTTP_200_OK
                        )
                    
                    report.status = new_status
                    report.save()

            # Send notification to user
            title = "Report Status Updated"
            if new_status == "in_progress":
                body = "Your report is now being looked into by a volunteer or NGO."
            else:
                body = "Your report has been marked as resolved. Thank you for your support!"

            send_and_log_notification(
                recipient_id=report.user_id,
                recipient_type="user",
                title=title,
                body=body,
                data={"report_id": str(report.report_id), "status": new_status},
                report=report
            )

            return Response(
                {"message": f"Report marked as {new_status}"}, 
                status=status.HTTP_200_OK
            )

        except InjuryReport.DoesNotExist:
            return Response(
                {"error": "Report not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], url_path='nearby')
    def nearby_reports(self, request):
        """Get nearby reports based on location"""
        try:
            lat = float(request.query_params.get('lat'))
            lon = float(request.query_params.get('lon'))
            radius_km = float(request.query_params.get('radius', 5))  # Default 5km radius
            
            # Validate coordinates
            if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                return Response(
                    {"error": "Invalid latitude or longitude values"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            nearby_reports = get_nearby_reports(lat, lon, radius_km=radius_km)
            serializer = self.get_serializer(nearby_reports, many=True)
            return Response(serializer.data)
            
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid latitude or longitude parameters"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='ngo-specific')
    def ngo_specific_reports(self, request):
        """Get reports specific to the authenticated NGO"""
        user_id = request.user.id
        reports = InjuryReport.objects.filter(ngo_assigned_id=user_id)
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)


class SavePushTokenView(CreateAPIView):
    """View for saving push notification tokens"""
    queryset = ExpoPushToken.objects.all()
    permission_classes = []  # Consider adding authentication if needed

    def post(self, request, *args, **kwargs):
        user_id = request.data.get('user_id')
        token = request.data.get('token')
        
        # Validate required fields
        if not user_id or not token:
            return Response(
                {"error": "Missing required fields: user_id, token"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate token format (basic validation)
        if not token.startswith('ExponentPushToken['):
            return Response(
                {"error": "Invalid token format"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Update or create token
            ExpoPushToken.objects.update_or_create(
                user_id=user_id, 
                defaults={"token": token}
            )
            return Response(
                {"message": "Token saved successfully"}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to save token: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )