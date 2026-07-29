"""
Reusable DRF permission classes shared across StartPilot apps.
"""
from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Object-level permission: only the owner of an object may access it.
    The object must expose a ``user`` attribute pointing to the owner.
    """

    message = "You do not have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        """Return True only when the requesting user owns the object."""
        return bool(request.user and request.user.is_authenticated and obj.user == request.user)


class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission: read is allowed for any authenticated user;
    write (PUT, PATCH, DELETE) is restricted to the owner.
    """

    def has_object_permission(self, request, view, obj):
        """Allow safe methods for any authenticated user, writes only for owners."""
        from rest_framework.permissions import SAFE_METHODS

        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and obj.user == request.user)
