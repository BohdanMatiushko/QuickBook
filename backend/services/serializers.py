from rest_framework import serializers
from .models import Category, Service, ServiceSpecialist

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'is_active', 'sort_order', 'created_at']

class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Service
        fields = [
            'id', 'name', 'category', 'category_name', 'description',
            'price', 'duration', 'is_active', 'max_clients', 'image_url',
            'created_at', 'updated_at'
        ]

class ServiceSpecialistSerializer(serializers.ModelSerializer):
    specialist_name = serializers.ReadOnlyField(source='specialist.get_full_name')
    service_name = serializers.ReadOnlyField(source='service.name')

    class Meta:
        model = ServiceSpecialist
        fields = ['id', 'service', 'service_name', 'specialist', 'specialist_name', 'experience_years', 'is_primary']
