from django.urls import path
from .views import test_appwrite

urlpatterns = [
    path('test-appwrite/', test_appwrite),
]
