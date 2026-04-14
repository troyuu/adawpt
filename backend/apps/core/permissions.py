from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to admin users."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsOwnerOrAdmin(BasePermission):
    """Allow access to object owner or admin."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        # Check common owner fields
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'applicant'):
            return obj.applicant == request.user
        if hasattr(obj, 'reporter'):
            return obj.reporter == request.user
        if hasattr(obj, 'donor'):
            return obj.donor == request.user
        if hasattr(obj, 'recipient'):
            return obj.recipient == request.user
        return False
