from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CSRFView, RegisterView, LoginView, LogoutView, MeView,
    NotificationViewSet, SpecialistViewSet,
)

router = DefaultRouter()
router.register(r'specialists', SpecialistViewSet, basename='specialist')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('csrf/', CSRFView.as_view(), name='csrf'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('', include(router.urls)),
]
