from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NGOViewSet

# Create router and register the ViewSet
router = DefaultRouter()
router.register(r'', NGOViewSet, basename='ngo')

urlpatterns = [
    # ViewSet URLs - handles all NGO operations
    path('', include(router.urls)),
]

