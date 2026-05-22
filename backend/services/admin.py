from django.contrib import admin
from .models import Category, Service, ServiceSpecialist, ServiceTimeSlot


class ServiceTimeSlotInline(admin.TabularInline):
    model = ServiceTimeSlot
    extra = 1


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'owner', 'booking_mode', 'max_clients', 'is_active']
    inlines = [ServiceTimeSlotInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_global', 'created_by', 'is_active', 'sort_order']
    list_filter = ['is_global', 'is_active']
admin.site.register(ServiceSpecialist)
