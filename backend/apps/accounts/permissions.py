"""
Account-specific DRF permission classes.
"""
from rest_framework.permissions import BasePermission


class IsEmailVerified(BasePermission):
    """
    Allow access only to users who have verified their email address.
    """

    message = "Email verification required to access this resource."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_email_verified
        )


class IsAdminOrSuperAdmin(BasePermission):
    """
    Allow access to Staff Administrators and Super Administrators.
    """

    message = "Administrative privileges required to access this resource."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                getattr(request.user, "role", "") in ["admin", "super_admin"]
                or request.user.is_staff
                or request.user.is_superuser
            )
        )


class IsSuperAdmin(BasePermission):
    """
    Allow access only to Super Administrators.
    """

    message = "Super Administrator privileges required to access this resource."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                getattr(request.user, "role", "") == "super_admin"
                or request.user.is_superuser
            )
        )
