from django.utils import timezone
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import Appointment
from .serializers import AppointmentSerializer


@extend_schema_view(
    list=extend_schema(description="Список бронювань"),
    create=extend_schema(description="Створити бронювання"),
)
class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        role = self.request.query_params.get('role')
        if user.is_staff:
            return Appointment.objects.select_related('client', 'service', 'specialist').all()
        if user.is_employee and role == 'specialist':
            return Appointment.objects.filter(
                specialist=user
            ).select_related('client', 'service', 'specialist')
        return Appointment.objects.filter(
            client=user
        ).select_related('client', 'service', 'specialist')

    def perform_destroy(self, instance):
        instance.status = 'cancelled'
        instance.save(update_fields=['status'])
