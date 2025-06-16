from django.urls import path
from .views import RegisterNGOView, NGOSearchView

urlpatterns= [
    path('register/', RegisterNGOView.as_view(), name='register-ngo'),
    path('search/ngo/', NGOSearchView.as_view(), name='search-ngo'),
]