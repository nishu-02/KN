from django.urls import path
from .views import RegisterNGOView, NGOSearchView, AcceptReportView

urlpatterns = [
    path('register/', RegisterNGOView.as_view(), name='register-ngo'),
    path('search/', NGOSearchView.as_view(), name='search-ngo'),
    path('reports/<str:report_id>/accept/', AcceptReportView.as_view(), name='accept-report'),
]