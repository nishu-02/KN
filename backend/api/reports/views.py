import base64
import uuid
import io
import json

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

from .models import InjuryReport
from users.models import UserPushToken
from .serializers import InjuryReportSerializer
from .services.gemini_client import analyze_animal_injury
from .services.appwrite_service import (
    create_appwrite_report,
    upload_image_to_appwrite,
    get_image_url
)

from reports.services.reverse_geocode import reverse_geocode
from reports.services.geo import get_nearby_reports
from users.models import UserProfile
from utils.logger import (
    reports_logger,
    log_api_request,
    log_report_activity,
    log_error_with_context,
)
from utils.validators import validate_location_data, validate_expo_push_token

# End of imports

class InjuryReportViewSet(viewsets.ModelViewSet):
    queryset = InjuryReport.objects.all()
    serializer_class = InjuryReportSerializer
    permission_classes = [IsAuthenticated]

    @log_api_request(reports_logger)
    def create(self, request, *args, **kwargs):
        try:
            image_file = request.FILES.get('image')
            location = request.data.get('location')

            if isinstance(location, str):
                try:
                    location = json.loads(location)
                except json.JSONDecodeError:
                    return Response({"error": "Invalid location format"}, status=400)

            if not image_file or not location:
                return Response({"error": "Missing required fields"}, status=400)

            validate_location_data(location)
            lat = float(location['latitude'])
            lon = float(location['longitude'])

            location['address'] = reverse_geocode(lat, lon) or f"Near {lat}, {lon}"

            image_bytes = image_file.read()
            base64_image = base64.b64encode(image_bytes).decode('utf-8')

            ai_response = analyze_animal_injury(base64_image)
            if not ai_response.get('success'):
                return Response({"error": ai_response['error']}, status=502)

            ai_result = ai_response['result']

            file_like = io.BytesIO(image_bytes)
            file_like.name = image_file.name
            file_id = upload_image_to_appwrite(file_like)
            image_url = get_image_url(file_id)

            with transaction.atomic():
                report = InjuryReport.objects.create(
                    report_id=uuid.uuid4(),
                    user_id=request.user.id,
                    image_url=image_url,
                    location=json.dumps(location),
                    latitude=lat,
                    longitude=lon,
                    status='pending',
                    title=ai_result.get('title', ''),
                    description=ai_result.get('description', ''),
                    species=ai_result.get('species', 'Unknown'),
                    breed=ai_result.get('breed', 'Unknown'),
                    age=ai_result.get('age', 'Unknown'),
                    gender=ai_result.get('gender', 'Unknown'),
                    weight=ai_result.get('weight', 'Unknown'),
                    severity=ai_result.get('severity', 'Unknown'),
                    injury_summary=ai_result.get('injurySummary', ''),
                    symptoms=ai_result.get('symptoms', []),
                    urgency=ai_result.get('urgency', 'Unknown'),
                    behavior=ai_result.get('behavior', 'Unknown'),
                    context=ai_result.get('context', 'Unknown'),
                    confidence_score=ai_result.get('confidenceScore'),
                    care_tips=ai_result.get('careTips', []),
                    immediate_actions=ai_result.get('actions', []),
                    environment_factors=ai_result.get('environmentFactors', ''),
                    ai_analysis=ai_result
                )


                create_appwrite_report(report)

                # Send injury report notification to NGOs and volunteers
                from utils.notification_triggers import notify_injury_report_created, notify_emergency_alert
                notify_injury_report_created(report)
                # Optionally, also send emergency alert to all users
                notify_emergency_alert(str(report.report_id), location.get('address', f"Near {lat}, {lon}"))

            log_report_activity(
                str(report.report_id), 'created', request.user.id,
                {'ai_analysis_success': True, 'image_uploaded': True, 'location': location}
            )

            serializer = self.get_serializer(report)
            return Response({
                "message": "Injury report generated successfully",
                "report": serializer.data,
            }, status=201)

        except Exception as e:
            log_error_with_context(reports_logger, e, {
                'action': 'create_report',
                'user_id': str(request.user.id),
            })
            return Response({"error": str(e)}, status=500)

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        new_status = request.data.get('status')
        allowed_statuses = ['in_progress', 'resolved']
        volunteer_id = request.data.get('volunteer_id')

        if new_status not in allowed_statuses:
            return Response({"error": "Invalid status"}, status=400)

        try:
            report = self.get_object()

            is_ngo = report.ngo_assigned and report.ngo_assigned.ngo_id == request.user.id
            is_volunteer = (
                report.volunteer_assigned and
                report.volunteer_assigned.appwrite_user_id == request.user.id
            )

            with transaction.atomic():
                if report.status == 'pending':
                    if volunteer_id:
                        try:
                            volunteer = UserProfile.objects.get(
                                appwrite_user_id=volunteer_id, is_volunteer=True
                            )
                            report.volunteer_assigned = volunteer
                            report.status = new_status
                            report.save()
                            is_volunteer = True
                        except UserProfile.DoesNotExist:
                            return Response({"error": "Volunteer not found"}, status=404)
                    elif is_ngo:
                        report.status = new_status
                        report.save()
                    else:
                        return Response({"error": "Unauthorized"}, status=403)
                else:
                    if not (is_ngo or is_volunteer):
                        return Response({"error": "Unauthorized"}, status=403)

                    if report.status == 'resolved':
                        return Response({"message": "Already resolved"}, status=200)

                    report.status = new_status
                    report.save()

            # Send status update using consolidated notification service
            from notifications.consolidated_service import send_status_update
            send_status_update(
                user_id=str(report.user_id),
                report_id=str(report.report_id),
                new_status=new_status,
                location=json.loads(report.location).get('address', 'Unknown location')
            )

            return Response({"message": f"Report marked as {new_status}"}, status=200)

        except InjuryReport.DoesNotExist:
            return Response({"error": "Report not found"}, status=404)

    @action(detail=False, methods=['get'], url_path='nearby')
    def nearby_reports(self, request):
        try:
            lat = float(request.query_params.get('lat'))
            lon = float(request.query_params.get('lon'))
            radius = float(request.query_params.get('radius', 5))

            if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                return Response({"error": "Invalid coordinates"}, status=400)

            reports = get_nearby_reports(lat, lon, radius_km=radius)
            serializer = self.get_serializer(reports, many=True)
            return Response(serializer.data)

        except (TypeError, ValueError):
            return Response({"error": "Invalid coordinates"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=['get'], url_path='ngo-specific')
    def ngo_specific_reports(self, request):
        user_id = request.user.id
        reports = InjuryReport.objects.filter(ngo_assigned_id=user_id)
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)
