from rest_framework.routers import DefaultRouter
from .views import UserReportsViewSet, UserProfileViewSet, VolunteerApplicationViewSet

router = DefaultRouter()
router.register(r'user-reports', UserReportsViewSet, basename='user-reports')
router.register(r'user-profile', UserProfileViewSet, basename='user-profile')
router.register(r'volunteer-applications', VolunteerApplicationViewSet, basename='volunteer-applications')

urlpatterns = router.urls