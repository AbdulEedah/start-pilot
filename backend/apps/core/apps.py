"""AppConfig for the core app."""
from django.apps import AppConfig


class CoreConfig(AppConfig):
    """Core app – shared utilities, base classes, and health checks."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core"
    label = "core"
