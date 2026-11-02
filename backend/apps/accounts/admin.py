"""
Django Admin registrations for the accounts app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import EmailVerificationToken, PasswordResetToken, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for the custom User model."""

    list_display = ["email", "full_name", "is_email_verified", "is_active", "is_staff", "date_joined"]
    list_filter = ["is_active", "is_staff", "is_email_verified"]
    search_fields = ["email", "full_name"]
    ordering = ["-date_joined"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("full_name", "avatar", "google_id")}),
        (_("Status"), {"fields": ("is_email_verified",)}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "full_name", "password1", "password2"),
            },
        ),
    )


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    """Admin interface for email verification tokens."""

    list_display = ["user", "created_at", "expires_at", "is_expired"]
    list_filter = ["created_at"]
    search_fields = ["user__email"]
    readonly_fields = ["token", "created_at"]

    @admin.display(boolean=True, description="Expired?")
    def is_expired(self, obj):
        return obj.is_expired


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """Admin interface for password reset tokens."""

    list_display = ["user", "is_used", "created_at", "expires_at", "is_expired"]
    list_filter = ["is_used", "created_at"]
    search_fields = ["user__email"]
    readonly_fields = ["token", "created_at"]

    @admin.display(boolean=True, description="Expired?")
    def is_expired(self, obj):
        return obj.is_expired
