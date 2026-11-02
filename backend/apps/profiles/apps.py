"""AppConfig for the profiles app."""
from django.apps import AppConfig


class ProfilesConfig(AppConfig):
    """Profiles app – StartupProfile onboarding data and generation status."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.profiles"
    label = "profiles"
