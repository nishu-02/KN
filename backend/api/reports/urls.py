from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InjuryReportViewSet, SavePushTokenView

# Set up DRF router for viewset
router = DefaultRouter()
router.register(r'reports', InjuryReportViewSet, basename='injuryreport')

urlpatterns = [
    path('', include(router.urls)),
    path('save-push-token/', SavePushTokenView.as_view(), name='save_push_token'),
]
