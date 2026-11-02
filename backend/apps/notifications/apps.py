"""AppConfig for the notifications app."""
from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    """Notifications app – in-app notifications, email dispatch, and Celery tasks."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.notifications"
    label = "notifications"
