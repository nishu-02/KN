from django.urls import path
from .views import (
    RegisterNGOView,
    NGOSearchView,
    AcceptReportView,
    AssignedReportView,
    DashboardStatsView,
    NGODetailView,
    NGOViewVolunteerRequests,
    UpdateApplicationStatusView,
    )

urlpatterns = [
    path('register/', RegisterNGOView.as_view(), name='register-ngo'),
    path('search/', NGOSearchView.as_view(), name='search-ngo'),
    path('reports/<str:report_id>/accept/', AcceptReportView.as_view(), name='accept-report'),
    path('assigned-reports/', AssignedReportView.as_view(), name='assigned-reports'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashbaord'),
    path('<str:ngo_id>/', NGODetailView.as_view(), name='ngo-detail'),

    # Application part
    path('applications/', NGOViewVolunteerRequests.as_view(), name='view-volunteers'),
    path('applications/<int:application_id>/accept/', UpdateApplicationStatusView.as_view(), name='update-volunteer-status'),
]