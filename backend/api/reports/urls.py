from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InjuryReportViewSet

# Set up DRF router for viewset
router = DefaultRouter()
router.register(r'reports', InjuryReportViewSet, basename='injuryreport')

urlpatterns = [
    path('', include(router.urls)),
]
