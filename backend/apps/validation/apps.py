"""AppConfig for the validation app."""
from django.apps import AppConfig


class ValidationConfig(AppConfig):
    """Validation app – ValidationReport model and AI generation service."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.validation"
    label = "validation"
