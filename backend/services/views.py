from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, IsAdminUser
from drf_spectacular.utils import extend_schema, extend_schema_view
from .models import Category, Service
from .serializers import CategorySerializer, ServiceSerializer

@extend_schema_view(
    list=extend_schema(description="Отримати список усіх категорій"),
    retrieve=extend_schema(description="Отримати деталі категорії"),
)
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

@extend_schema_view(
    list=extend_schema(description="Отримати список усіх послуг"),
    retrieve=extend_schema(description="Отримати деталі послуги"),
    create=extend_schema(description="Створити нову послугу (лише для адміністраторів)"),
)
class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]
