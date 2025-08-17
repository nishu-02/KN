from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

# Create router and register the ViewSet
router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    # ViewSet URLs - handles all notification operations
    path('', include(router.urls)),
]
