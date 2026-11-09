"""
Management command: ensure_superuser

Creates or updates a superuser non-interactively using environment variables.
Useful for environments where interactive shell access is restricted (e.g. Render free tier).

Usage:
    python manage.py ensure_superuser
"""
import logging
from django.core.management.base import BaseCommand
from decouple import config
from apps.accounts.models import User

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Creates or updates a superuser non-interactively from environment variables."

    def handle(self, *args, **options):
        email = config("DJANGO_SUPERUSER_EMAIL", default="lawalabdurrahim5401@gmail.com").strip().lower()
        password = config("DJANGO_SUPERUSER_PASSWORD", default="5401abdul")
        full_name = config("DJANGO_SUPERUSER_NAME", default="Abdurrahim Lawal")

        if not email or not password:
            self.stdout.write(self.style.WARNING("DJANGO_SUPERUSER_EMAIL or DJANGO_SUPERUSER_PASSWORD not set. Skipping."))
            return

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "full_name": full_name,
                "is_staff": True,
                "is_superuser": True,
                "is_email_verified": True,
                "is_active": True,
            },
        )

        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.is_email_verified = True
        user.is_active = True
        if full_name and not user.full_name:
            user.full_name = full_name
        user.save()

        action = "Created" if created else "Updated"
        msg = f"{action} superuser '{email}' successfully!"
        logger.info(msg)
        self.stdout.write(self.style.SUCCESS(msg))

