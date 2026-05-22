from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsSpecialistOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.is_employee


class IsCategoryOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_staff or request.user.is_employee)

    def has_object_permission(self, request, view, obj):
        if obj.is_global:
            return request.user.is_staff
        if request.user.is_staff:
            return True
        return obj.created_by_id == request.user.id


class IsServiceOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_staff or request.user.is_employee)

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.owner_id == request.user.id
