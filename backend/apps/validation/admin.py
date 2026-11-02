"""Django Admin for the validation app."""
from django.contrib import admin

from .models import ValidationReport


@admin.register(ValidationReport)
class ValidationReportAdmin(admin.ModelAdmin):
    """Admin interface for ValidationReport."""

    list_display = ["profile", "score", "generated_at"]
    list_filter = ["score"]
    search_fields = ["profile__user__email"]
    readonly_fields = [f.name for f in ValidationReport._meta.get_fields()]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
