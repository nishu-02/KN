from django.urls import path
from.views import InjuryReportUploadView

urlpatterns = [
    path('upload/', InjuryReportUploadView.as_view(), name='Injury_report_creation')
]
