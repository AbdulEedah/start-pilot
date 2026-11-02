"""AppConfig for the chat app."""
from django.apps import AppConfig


class ChatConfig(AppConfig):
    """Chat app – Conversation, Message models and AI Copilot service."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.chat"
    label = "chat"
