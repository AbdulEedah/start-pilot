"""AppConfig for the accounts app."""
from django.apps import AppConfig


class AccountsConfig(AppConfig):
    """Accounts app – user model, registration, JWT auth, Google OAuth, password reset."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"
    label = "accounts"

    def ready(self):
        """Import signals when the app registry is ready."""
        import apps.accounts.signals  # noqa: F401
