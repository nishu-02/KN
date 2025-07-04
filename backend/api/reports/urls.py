from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InjuryReportViewSet, SavePushTokenView

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView
)

# Set up DRF router for viewset
router = DefaultRouter()
router.register(r'reports', InjuryReportViewSet, basename='injuryreport')

urlpatterns = [
    path('', include(router.urls)),
    path('save-push-token/', SavePushTokenView.as_view(), name='save_push_token'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
