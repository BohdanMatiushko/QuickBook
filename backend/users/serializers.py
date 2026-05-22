from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User, Notification


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'is_client', 'is_employee', 'role', 'avatar_url',
        ]
        read_only_fields = fields

    def get_role(self, obj):
        if obj.is_employee:
            return 'specialist'
        return 'client'


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=['client', 'specialist'], write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone_number', 'first_name', 'last_name', 'role']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('Користувач з таким email вже існує.')
        return value.lower()

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('Це імʼя користувача вже зайняте.')
        return value

    def validate_phone_number(self, value):
        if not value or not str(value).strip():
            return None
        return value.strip()

    def validate_first_name(self, value):
        return value.strip() if value else ''

    def validate_last_name(self, value):
        return value.strip() if value else ''

    def create(self, validated_data):
        role = validated_data.pop('role')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.is_client = role == 'client'
        user.is_employee = role == 'specialist'
        user.set_password(password)
        user.save()
        return user


class SpecialistSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    services_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'display_name', 'avatar_url', 'services_count',
        ]

    def get_display_name(self, obj):
        full = obj.get_full_name()
        return full.strip() if full and full.strip() else obj.username


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs['email']
        password = attrs['password']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Невірний email або пароль.')
        authenticated = authenticate(
            request=self.context.get('request'),
            username=user.username,
            password=password,
        )
        if not authenticated:
            raise serializers.ValidationError('Невірний email або пароль.')
        attrs['user'] = authenticated
        return attrs


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'created_at', 'read_at']
