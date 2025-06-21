from django.urls import path
from .views import (
    InjuryReportUploadView,
    NearbyReportsView,
    NGOSpecificReportsView,
    UpdateReportStatusView
)

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView
)

urlpatterns = [
    path('upload/', InjuryReportUploadView.as_view(), name='Injury_report_creation'),
    path('nearby/', NearbyReportsView.as_view(), name='nearby_reports'),
    path('ngo/', NGOSpecificReportsView.as_view(), name='ngo_reports'),
    path('resolve-report/<uuid:report_id>/', UpdateReportStatusView.as_view(), name='resolve-report'),


    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc')
]
