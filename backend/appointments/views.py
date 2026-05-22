from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view
from .models import Appointment
from .serializers import AppointmentSerializer

@extend_schema_view(
    list=extend_schema(description="Отримати список бронювань (клієнти бачать свої, адміни — усі)"),
    create=extend_schema(description="Створити нове бронювання"),
    retrieve=extend_schema(description="Отримати деталі бронювання"),
)
class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Appointment.objects.all()
        return Appointment.objects.filter(client=user)
