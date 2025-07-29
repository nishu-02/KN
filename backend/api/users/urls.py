from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserReportViewSet, UserProfileViewSet, VolunteerApplicationViewSet
from .auth_views import register_user, get_account_type

router = DefaultRouter()
router.register(r'reports', UserReportViewSet, basename='user-reports')
router.register(r'profile', UserProfileViewSet, basename='user-profile')
router.register(r'volunteer-applications', VolunteerApplicationViewSet, basename='volunteer-applications')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register', register_user, name='auth-register'),
    path('auth/get_type', get_account_type, name='auth-get-type'),
]