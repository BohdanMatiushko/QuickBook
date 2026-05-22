from rest_framework import serializers
from .models import Appointment, Review, Payment

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
        read_only_fields = ['client'] # Клієнт визначається автоматично по request.user або адміном

    def create(self, validated_data):
        # Якщо користувач не вказав клієнта (через read_only), беремо з request
        request = self.context.get('request')
        if request and hasattr(request, 'user') and not request.user.is_staff:
            validated_data['client'] = request.user
        return super().create(validated_data)

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
