from rest_framework import serializers
from .models import Category, Service, ServiceSpecialist, ServiceTimeSlot
from .category_utils import resolve_category


class CategorySerializer(serializers.ModelSerializer):
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'description', 'icon', 'is_active', 'is_global',
            'sort_order', 'is_mine', 'created_at',
        ]
        read_only_fields = ['is_global', 'created_at', 'is_mine']

    def get_is_mine(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return not obj.is_global and obj.created_by_id == request.user.id

    def create(self, validated_data):
        request = self.context['request']
        validated_data['created_by'] = request.user
        validated_data['is_global'] = False
        return super().create(validated_data)


class ServiceTimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceTimeSlot
        fields = ['id', 'start_time']


class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    owner_name = serializers.SerializerMethodField()
    time_slots = ServiceTimeSlotSerializer(many=True, required=False)

    class Meta:
        model = Service
        fields = [
            'id', 'name', 'category', 'category_name', 'description',
            'price', 'duration', 'is_active', 'max_clients',
            'booking_mode', 'display_mode', 'available_weekdays',
            'owner', 'owner_name', 'image_url', 'time_slots',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['owner', 'display_mode', 'created_at', 'updated_at']
        extra_kwargs = {'category': {'required': False, 'allow_null': True}}

    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name() or obj.owner.username
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['category_name'] = instance.category.name if instance.category_id else ''
        return data

    def _apply_defaults(self, attrs):
        mode = attrs.get(
            'booking_mode',
            self.instance.booking_mode if self.instance else 'duration_slots',
        )
        attrs['display_mode'] = 'tiles' if mode == 'fixed_slots' else 'timeline'

        weekdays = attrs.get('available_weekdays')
        if weekdays is not None and len(weekdays) == 0:
            raise serializers.ValidationError({
                'available_weekdays': 'Оберіть хоча б один день для запису.',
            })
        if 'available_weekdays' not in attrs and not self.instance:
            attrs['available_weekdays'] = [0, 1, 2, 3, 4, 5, 6]
        return attrs

    def validate(self, attrs):
        request = self.context.get('request')
        category = attrs.get('category')
        category_name = attrs.pop('category_name', None)

        if not category:
            resolved = resolve_category(
                category_name=category_name,
                user=request.user if request else None,
            )
            if not resolved:
                raise serializers.ValidationError({
                    'category': 'Вкажіть категорію (зі списку або свою назву).',
                })
            attrs['category'] = resolved
        elif not category.is_active:
            raise serializers.ValidationError({'category': 'Категорія неактивна.'})

        if attrs.get('booking_mode') == 'fixed_slots' and not self.instance:
            if not attrs.get('time_slots'):
                raise serializers.ValidationError({
                    'time_slots': 'Вкажіть години через кому (наприклад 09:00, 16:00).',
                })

        return self._apply_defaults(attrs)

    def create(self, validated_data):
        time_slots_data = validated_data.pop('time_slots', [])
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.is_employee:
            validated_data['owner'] = request.user
        service = super().create(validated_data)
        for slot_data in time_slots_data:
            ServiceTimeSlot.objects.create(service=service, **slot_data)
        if request and request.user.is_employee:
            ServiceSpecialist.objects.get_or_create(
                service=service, specialist=request.user,
                defaults={'is_primary': True},
            )
        return service

    def update(self, instance, validated_data):
        time_slots_data = validated_data.pop('time_slots', None)
        service = super().update(instance, validated_data)
        if time_slots_data is not None:
            instance.time_slots.all().delete()
            for slot_data in time_slots_data:
                ServiceTimeSlot.objects.create(service=service, **slot_data)
        return service


class ServiceSpecialistSerializer(serializers.ModelSerializer):
    specialist_name = serializers.ReadOnlyField(source='specialist.get_full_name')
    service_name = serializers.ReadOnlyField(source='service.name')

    class Meta:
        model = ServiceSpecialist
        fields = ['id', 'service', 'service_name', 'specialist', 'specialist_name', 'experience_years', 'is_primary']
