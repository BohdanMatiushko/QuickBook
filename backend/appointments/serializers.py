from rest_framework import serializers
from .models import Appointment, Review, Payment
from services.availability import validate_booking, compute_end_time
from users.models import Notification


class AppointmentSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.get_full_name')
    service_name = serializers.ReadOnlyField(source='service.name')
    specialist_name = serializers.ReadOnlyField(source='specialist.get_full_name')

    class Meta:
        model = Appointment
        fields = [
            'id', 'client', 'client_name', 'service', 'service_name',
            'specialist', 'specialist_name', 'date', 'start_time', 'end_time',
            'status', 'notes', 'created_at'
        ]
        read_only_fields = ['client', 'specialist', 'end_time']

    def create(self, validated_data):
        request = self.context.get('request')
        service = validated_data['service']
        if request and hasattr(request, 'user') and not request.user.is_staff:
            validated_data['client'] = request.user

        start_time = validated_data['start_time']
        date = validated_data['date']
        validate_booking(service, date, start_time)

        specialist = service.owner
        if specialist:
            validated_data['specialist'] = specialist
        validated_data['end_time'] = compute_end_time(start_time, service.duration)

        appointment = super().create(validated_data)
        self._notify_specialist(appointment)
        return appointment

    def _notify_specialist(self, appointment):
        specialist = appointment.specialist
        if not specialist:
            return
        client = appointment.client
        client_label = client.get_full_name() or client.username
        Notification.objects.create(
            recipient=specialist,
            title='Нове бронювання',
            message=(
                f'{client_label} обрав(ла) послугу «{appointment.service.name}» '
                f'на {appointment.date.strftime("%d.%m.%Y")} о {appointment.start_time.strftime("%H:%M")}.'
            ),
            notification_type='new_booking',
        )


class ReviewSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.get_full_name')

    class Meta:
        model = Review
        fields = ['id', 'appointment', 'client', 'client_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['client']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
