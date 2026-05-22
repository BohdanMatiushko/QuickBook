from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import Category, Service
from .serializers import CategorySerializer, ServiceSerializer
from .permissions import IsSpecialistOrReadOnly, IsServiceOwnerOrAdmin, IsCategoryOwnerOrAdmin
from .availability import get_availability


@extend_schema_view(
    list=extend_schema(description="Загальні та власні категорії фахівця"),
    create=extend_schema(description="Створити власну категорію"),
)
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsSpecialistOrReadOnly()]
        return [IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        qs = Category.objects.filter(is_active=True)
        user = self.request.user
        if user.is_authenticated and user.is_employee:
            return qs.filter(Q(is_global=True) | Q(created_by=user)).distinct()
        return qs.filter(is_global=True)


@extend_schema_view(
    list=extend_schema(description="Отримати список послуг"),
    retrieve=extend_schema(description="Отримати деталі послуги"),
)
class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsSpecialistOrReadOnly()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsServiceOwnerOrAdmin()]
        return [IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        qs = Service.objects.filter(is_active=True).select_related('category', 'owner').prefetch_related('time_slots')
        mine = self.request.query_params.get('mine')
        if mine and self.request.user.is_authenticated:
            if self.request.user.is_employee:
                return qs.filter(owner=self.request.user)
            return qs.none()
        owner_id = self.request.query_params.get('owner')
        if owner_id:
            qs = qs.filter(owner_id=owner_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['get'], url_path='availability')
    def availability(self, request, pk=None):
        service = self.get_object()
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'detail': 'Параметр date обовʼязковий (YYYY-MM-DD).'}, status=400)
        from datetime import datetime
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'detail': 'Невірний формат дати.'}, status=400)
        return Response(get_availability(service, date))
