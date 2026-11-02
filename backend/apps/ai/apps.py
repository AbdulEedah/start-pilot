"""AppConfig for the ai app."""
from django.apps import AppConfig


class AIConfig(AppConfig):
    """
    AI app – provider abstraction layer, Gemini implementation,
    prompt template management, and usage logging.
    """

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.ai"
    label = "ai"
