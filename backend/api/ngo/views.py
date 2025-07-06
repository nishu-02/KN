from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
from django.db import transaction

from .models import NGO
from .serializers import NGORegisterSerializer
from reports.models import InjuryReport
from reports.serializers import InjuryReportSerializer
from volunteers.models import VolunteerApplication
from volunteers.serializers import VolunteerApplicationSerializer
from notifications.utils import send_and_log_notification, update_notification_status


class NGOSearchPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class NGOViewSet(viewsets.ModelViewSet):
    """
    Complete NGO ViewSet handling all NGO operations including:
    - Registration (create)
    - Search and listing (list)
    - Details (retrieve)
    - Report management
    - Dashboard statistics
    - Volunteer applications
    """
    queryset = NGO.objects.all()
    serializer_class = NGORegisterSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'ngo_id'
    pagination_class = NGOSearchPagination
    filter_backends = [SearchFilter]
    search_fields = ['name', 'description', 'category', 'location']

    def create(self, request, *args, **kwargs):
        """Register a new NGO"""
        user_id = getattr(request, 'user_id', None)
        
        if not user_id:
            return Response({
                "error": "Unauthorized"
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Check if NGO already registered with this user
        if NGO.objects.filter(appwrite_user_id=user_id).exists():
            return Response({
                "error": "NGO already registered with this user."
            }, status=status.HTTP_409_CONFLICT)

        data = request.data.copy()
        data["appwrite_user_id"] = user_id  # Inject Appwrite user ID
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "NGO registered successfully",
                "ngo_id": serializer.instance.ngo_id
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

    def list(self, request, *args, **kwargs):
        """List and search NGOs with pagination"""
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """Get specific NGO details"""
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='accept-report')
    def accept_report(self, request, ngo_id=None):
        """Accept a report by NGO"""
        try:
            # Validate NGO ownership
            ngo = self.get_object()
            if ngo.appwrite_user_id != request.user_id:
                return Response({
                    "error": "Unauthorized"
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Validate lat/lon in request
            lat = request.data.get('lat')
            lon = request.data.get('lon')
            report_id = request.data.get('report_id')
            
            if not lat or not lon:
                return Response({
                    "error": "Missing NGO location coordinates"
                }, status=status.HTTP_400_BAD_REQUEST)

            if not report_id:
                return Response({
                    "error": "Missing report_id"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Fetch and lock the report
            with transaction.atomic():
                report = InjuryReport.objects.select_for_update().get(report_id=report_id)
                
                if report.status != 'pending':
                    return Response({
                        "error": "Report already taken"
                    }, status=status.HTTP_409_CONFLICT)

                # Assign report to NGO
                report.ngo_assigned_id = request.user_id
                report.status = 'in_progress'
                report.save()

            # Update notification status
            update_notification_status(report_id, request.user_id, 'accepted')
            
            # Notify the user
            send_and_log_notification(
                recipient_id=report.user_id,
                recipient_type="user",
                title="Report Accepted",
                body="Your report has been accepted by an NGO and is now in progress.",
                data={"report_id": str(report.report_id), "status": "in_progress"},
                report=report
            )

            return Response({
                "message": "Report accepted successfully",
                "report_id": report_id,
                "route": {
                    "from": {
                        "lat": lat,
                        "lon": lon
                    },
                    "to": {
                        "lat": report.latitude,
                        "lon": report.longitude
                    }
                }
            }, status=status.HTTP_200_OK)

        except InjuryReport.DoesNotExist:
            return Response({
                "error": "Report not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "error": "Internal server error"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], url_path='assigned-reports')
    def assigned_reports(self, request, ngo_id=None):
        """Get all reports assigned to this NGO"""
        try:
            ngo = self.get_object()
            if ngo.appwrite_user_id != request.user_id:
                return Response({
                    "error": "Unauthorized"
                }, status=status.HTTP_401_UNAUTHORIZED)

            reports = InjuryReport.objects.filter(ngo_assigned_id=request.user_id)
            serializer = InjuryReportSerializer(reports, many=True)
            return Response(serializer.data)

        except NGO.DoesNotExist:
            return Response({
                "error": "NGO not found"
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request, ngo_id=None):
        """Get dashboard statistics for NGO"""
        try:
            ngo = self.get_object()
            if ngo.appwrite_user_id != request.user_id:
                return Response({
                    "error": "Unauthorized"
                }, status=status.HTTP_401_UNAUTHORIZED)

            user_id = request.user_id
            total = InjuryReport.objects.filter(ngo_assigned_id=user_id).count()
            in_progress = InjuryReport.objects.filter(
                ngo_assigned_id=user_id, 
                status='in_progress'
            ).count()
            resolved = InjuryReport.objects.filter(
                ngo_assigned_id=user_id, 
                status='resolved'
            ).count()

            return Response({
                "total_reports": total,
                "in_progress": in_progress,
                "resolved": resolved,
            })

        except NGO.DoesNotExist:
            return Response({
                "error": "NGO not found"
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'], url_path='report-timeline')
    def report_timeline(self, request, ngo_id=None):
        """Get timeline for a specific report"""
        try:
            ngo = self.get_object()
            if ngo.appwrite_user_id != request.user_id:
                return Response({
                    "error": "Unauthorized"
                }, status=status.HTTP_401_UNAUTHORIZED)

            report_id = request.query_params.get('report_id')
            if not report_id:
                return Response({
                    "error": "Missing report_id parameter"
                }, status=status.HTTP_400_BAD_REQUEST)

            report = InjuryReport.objects.get(report_id=report_id)

            # Check if user has access to this report
            if request.user_id not in [report.user_id, report.ngo_assigned_id]:
                return Response({
                    "error": "Unauthorized to view this report"
                }, status=status.HTTP_401_UNAUTHORIZED)

            history = report.status_history.all().order_by('-updated_at')
            data = [{
                "status": h.status,
                "updated_at": h.updated_at
            } for h in history]

            return Response({
                "timeline": data
            })

        except InjuryReport.DoesNotExist:
            return Response({
                "error": "Report not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except NGO.DoesNotExist:
            return Response({
                "error": "NGO not found"
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'], url_path='volunteer-requests')
    def volunteer_requests(self, request, ngo_id=None):
        """Get all volunteer applications for this NGO"""
        try:
            ngo = self.get_object()
            if ngo.appwrite_user_id != request.user_id:
                return Response({
                    "error": "Unauthorized"
                }, status=status.HTTP_401_UNAUTHORIZED)

            applications = ngo.volunteer_applications.all()
            serializer = VolunteerApplicationSerializer(applications, many=True)
            return Response(serializer.data)

        except NGO.DoesNotExist:
            return Response({
                "error": "NGO not found"
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'], url_path='update-application-status')
    def update_application_status(self, request, ngo_id=None):
        """Update volunteer application status"""
        try:
            ngo = self.get_object()
            if ngo.appwrite_user_id != request.user_id:
                return Response({
                    "error": "Unauthorized"
                }, status=status.HTTP_401_UNAUTHORIZED)

            application_id = request.data.get('application_id')
            new_status = request.data.get('status')
            allowed_statuses = ['rejected', 'accepted']

            if not application_id:
                return Response({
                    "error": "Missing application_id"
                }, status=status.HTTP_400_BAD_REQUEST)

            if new_status not in allowed_statuses:
                return Response({
                    "error": "Invalid status. Must be 'accepted' or 'rejected'"
                }, status=status.HTTP_400_BAD_REQUEST)

            application = VolunteerApplication.objects.get(id=application_id)
            
            if application.ngo.ngo_id != ngo_id:
                return Response({
                    "error": "Application does not belong to this NGO"
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            application.status = new_status
            application.save()

            return Response({
                "message": f"Application marked as {new_status}"
            }, status=status.HTTP_200_OK)
            
        except VolunteerApplication.DoesNotExist:
            return Response({
                "error": "Application not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except NGO.DoesNotExist:
            return Response({
                "error": "NGO not found"
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='update-report-status')
    def update_report_status(self, request, ngo_id=None):
        """Update status of an assigned report"""
        try:
            ngo = self.get_object()
            if ngo.appwrite_user_id != request.user_id:
                return Response({
                    "error": "Unauthorized"
                }, status=status.HTTP_401_UNAUTHORIZED)

            report_id = request.data.get('report_id')
            new_status = request.data.get('status')
            allowed_statuses = ['in_progress', 'resolved', 'cancelled']

            if not report_id:
                return Response({
                    "error": "Missing report_id"
                }, status=status.HTTP_400_BAD_REQUEST)

            if new_status not in allowed_statuses:
                return Response({
                    "error": "Invalid status"
                }, status=status.HTTP_400_BAD_REQUEST)

            report = InjuryReport.objects.get(report_id=report_id)
            
            if report.ngo_assigned_id != request.user_id:
                return Response({
                    "error": "Report not assigned to this NGO"
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            report.status = new_status
            report.save()

            # Send notification to user
            send_and_log_notification(
                recipient_id=report.user_id,
                recipient_type="user",
                title="Report Status Updated",
                body=f"Your report status has been updated to {new_status}",
                data={"report_id": str(report.report_id), "status": new_status},
                report=report
            )

            return Response({
                "message": f"Report status updated to {new_status}"
            }, status=status.HTTP_200_OK)
            
        except InjuryReport.DoesNotExist:
            return Response({
                "error": "Report not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except NGO.DoesNotExist:
            return Response({
                "error": "NGO not found"
            }, status=status.HTTP_404_NOT_FOUND)