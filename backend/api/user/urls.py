from django.urls import path
from .views import (
    UserOwnReportsView,
    UserHelpedReportsView, 
    ToggleVolunteerView,
    ApplyVolunteerView,
)

urlpatterns = [
    path('my-reports/', UserOwnReportsView.as_view(), name='user_own_reports'),
    path('helped-reports/', UserHelpedReportsView.as_view(), name='user_helped_reports'),
    path('toggle-volunteer/', ToggleVolunteerView.as_view(), name='toggle_volunteer'),
    path('str:ngo_id>/apply/', ApplyVolunteerView.as_view(), name='apply-volunteer'),
]
