import base64
import uuid
import io
import json

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import CreateAPIView
from django.db import transaction

from .models import InjuryReport, ExpoPushToken
from .serializers import InjuryReportSerializer, ExpoPushTokenSerializer
from .services.gemini_client import analyze_animal_injury
from .services.appwrite_service import (
    create_appwrite_report,
    create_appwrite_notification,
    upload_image_to_appwrite,
    get_image_url,
)
from reports.services.reverse_geocode import reverse_geocode
from reports.services.geo import get_nearby_reports
from users.models import UserProfile
from notifications.notification_triggers import notification_triggers
from notifications.utils import send_and_log_notification
from utils.logger import (
    reports_logger,
    log_api_request,
    log_function_call,
    log_report_activity,
    log_error_with_context,
)
from utils.validators import validate_location_data, validate_expo_push_token


class InjuryReportViewSet(viewsets.ModelViewSet):
    queryset = InjuryReport.objects.all()
    serializer_class = InjuryReportSerializer
    permission_classes = [IsAuthenticated]

    @log_api_request(reports_logger)
    def create(self, request, *args, **kwargs):
        try:
            image_file = request.FILES.get('image')
            user_id = request.data.get('user_id')
            location = request.data.get('location')

            if isinstance(location, str):
                try:
                    location = json.loads(location)
                except json.JSONDecodeError:
                    return Response({"error": "Invalid location format"}, status=400)

            if not image_file or not user_id or not location:
                return Response({"error": "Missing required fields"}, status=400)

            validate_location_data(location)
            lat = float(location['latitude'])
            lon = float(location['longitude'])

            # Get human-readable address
            location['address'] = reverse_geocode(lat, lon) or f"Near {lat}, {lon}"

            # Prepare image
            image_bytes = image_file.read()
            base64_image = base64.b64encode(image_bytes).decode('utf-8')

            # AI Analysis
            ai_response = analyze_animal_injury(base64_image)
            if not ai_response.get('success'):
                return Response({"error": ai_response['error']}, status=502)

            ai_result = ai_response['result']

            # Upload image
            file_like = io.BytesIO(image_bytes)
            file_like.name = image_file.name
            file_id = upload_image_to_appwrite(file_like)
            image_url = get_image_url(file_id)

            with transaction.atomic():
                report = InjuryReport.objects.create(
                    report_id=uuid.uuid4(),
                    user_id=user_id,
                    image_url=image_url,
                    location=json.dumps(location),
                    latitude=lat,
                    longitude=lon,
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
                    vet_timeline=ai_result.get('vetTimeline', 'Unknown'),
                    ai_confidence=ai_result.get('aiConfidence', 'Medium'),
                    severity_score=ai_result.get('severityScore'),
                    urgency_score=ai_result.get('urgencyScore'),
                    behavior_score=ai_result.get('behaviorScore'),
                    age_score=ai_result.get('ageScore'),
                    confidence_score=ai_result.get('confidenceScore'),
                    care_tips=ai_result.get('careTips', []),
                    immediate_actions=ai_result.get('actions', []),
                    environment_factors=ai_result.get('environmentFactors', ''),
                    vital_signs=ai_result.get('vitalSigns', {}),
                    ai_analysis=ai_result,
                    report_data=ai_result
                )

                # Appwrite: save + notify
                create_appwrite_report(report)
                notification_triggers.notify_new_injury_report(report)

            log_report_activity(
                str(report.report_id), 'created', user_id,
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
                'user_id': request.data.get('user_id'),
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

            send_and_log_notification(
                recipient_id=report.user_id,
                recipient_type="user",
                title="Report Status Updated",
                body="Your report status has changed to " + new_status,
                data={"report_id": str(report.report_id), "status": new_status},
                report=report
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


class SavePushTokenView(CreateAPIView):
    queryset = ExpoPushToken.objects.all()
    serializer_class = ExpoPushTokenSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user_id = request.data.get('user_id')
        token = request.data.get('token')

        if not user_id or not token:
            return Response({"error": "Missing user_id or token"}, status=400)

        try:
            validate_expo_push_token(token)
            ExpoPushToken.objects.update_or_create(
                user_id=user_id, defaults={"token": token}
            )
            return Response({"message": "Token saved successfully"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
