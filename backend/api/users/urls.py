from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserReportViewSet, UserProfileViewSet, VolunteerApplicationViewSet

router = DefaultRouter()
router.register(r'reports', UserReportViewSet, basename='user-reports')
router.register(r'profile', UserProfileViewSet, basename='user-profile')
router.register(r'volunteer-applications', VolunteerApplicationViewSet, basename='volunteer-applications')

urlpatterns = [
    path('', include(router.urls)),
]