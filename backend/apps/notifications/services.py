"""
Business-logic services for the notifications app.

NotificationService:
    Centralised service that creates in-app notifications and dispatches
    email notifications.  All email sending is done asynchronously via Celery.

Email sending helpers are also exposed as module-level functions so they
can be called directly from task functions.
"""
import logging

from django.conf import settings
from django.core.mail import EmailMessage
from django.template.loader import render_to_string

from apps.core.utils import build_frontend_url

from .models import Notification

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Low-level email sender
# ─────────────────────────────────────────────────────────────────────────────


def send_email(to_email: str, subject: str, template_name: str, context: dict) -> bool:
    """
    Render an HTML/plain-text email template and send it via Django's mail backend.

    Args:
        to_email:      Recipient email address.
        subject:       Email subject line.
        template_name: Path to the text template under templates/emails/.
        context:       Template context variables.

    Returns:
        True if the email was sent successfully, False otherwise.
    """
    try:
        body = render_to_string(f"emails/{template_name}", context)
        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        email.send(fail_silently=False)
        logger.info("Email sent to %s: %s", to_email, subject)
        return True
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to_email, exc)
        return False


# ─────────────────────────────────────────────────────────────────────────────
# Notification service
# ─────────────────────────────────────────────────────────────────────────────


class NotificationService:
    """
    Centralised notification dispatcher.

    All public methods create the appropriate Notification records and
    enqueue async email tasks via Celery.
    """

    @staticmethod
    def create_in_app(user, category: str, subject: str, message: str) -> Notification:
        """
        Create an in-app notification record for the given user.

        Args:
            user:     User instance.
            category: Notification category string.
            subject:  Short notification title.
            message:  Full notification body.

        Returns:
            Created Notification instance.
        """
        return Notification.objects.create(
            user=user,
            type="in_app",
            category=category,
            subject=subject,
            message=message,
        )

    @staticmethod
    def create_email_record(user, category: str, subject: str, message: str) -> Notification:
        """
        Create an email notification log record (does not send the email).

        Args:
            user:     User instance.
            category: Notification category string.
            subject:  Email subject.
            message:  Email body summary.

        Returns:
            Created Notification instance.
        """
        return Notification.objects.create(
            user=user,
            type="email",
            category=category,
            subject=subject,
            message=message,
        )

    @staticmethod
    def notify_welcome(user) -> None:
        """
        Send a welcome email and create an in-app welcome notification.

        Args:
            user: Newly registered User instance.
        """
        subject = f"Welcome to StartPilot, {user.first_name_display}!"
        message = (
            f"Hi {user.first_name_display}, welcome to StartPilot! "
            "We're excited to help you validate and launch your startup."
        )
        context = {
            "user": user,
            "frontend_url": settings.FRONTEND_URL,
        }
        send_email(user.email, subject, "welcome.txt", context)
        NotificationService.create_email_record(user, "welcome", subject, message)
        NotificationService.create_in_app(user, "welcome", subject, message)

    @staticmethod
    def notify_verification(user, token: str) -> None:
        """
        Send an email verification email.

        Args:
            user:  User instance.
            token: Raw verification token string.
        """
        verify_url = build_frontend_url(f"/verify-email/{token}")
        subject = "Verify your StartPilot email address"
        message = f"Please verify your email by visiting: {verify_url}"
        context = {
            "user": user,
            "verify_url": verify_url,
            "frontend_url": settings.FRONTEND_URL,
        }
        send_email(user.email, subject, "verification.txt", context)
        NotificationService.create_email_record(user, "verification", subject, message)

    @staticmethod
    def notify_password_reset(user, token: str) -> None:
        """
        Send a password reset email.

        Args:
            user:  User instance.
            token: Raw password-reset token string.
        """
        reset_url = build_frontend_url(f"/reset-password/{token}")
        subject = "Reset your StartPilot password"
        message = f"Reset your password by visiting: {reset_url}"
        context = {
            "user": user,
            "reset_url": reset_url,
            "frontend_url": settings.FRONTEND_URL,
        }
        send_email(user.email, subject, "password_reset.txt", context)
        NotificationService.create_email_record(user, "password_reset", subject, message)

    @staticmethod
    def notify_report_ready(user) -> None:
        """
        Send email + in-app notification when the validation report is ready.

        Args:
            user: User instance whose report has been generated.
        """
        dashboard_url = build_frontend_url("/dashboard")
        subject = "Your StartPilot Validation Report is ready!"
        message = (
            "Great news! Your AI-powered startup validation report has been generated. "
            f"View it at {dashboard_url}"
        )
        context = {
            "user": user,
            "dashboard_url": dashboard_url,
            "frontend_url": settings.FRONTEND_URL,
        }
        send_email(user.email, subject, "report_ready.txt", context)
        NotificationService.create_email_record(user, "report_ready", subject, message)
        NotificationService.create_in_app(user, "report_ready", subject, message)

    @staticmethod
    def notify_roadmap_ready(user) -> None:
        """
        Send email + in-app notification when the roadmap is ready.

        Args:
            user: User instance whose roadmap has been generated.
        """
        roadmap_url = build_frontend_url("/dashboard/roadmap")
        subject = "Your StartPilot Roadmap is ready!"
        message = (
            "Your personalised startup roadmap has been created. "
            f"View it at {roadmap_url}"
        )
        context = {
            "user": user,
            "roadmap_url": roadmap_url,
            "frontend_url": settings.FRONTEND_URL,
        }
        send_email(user.email, subject, "roadmap_ready.txt", context)
        NotificationService.create_email_record(user, "roadmap_ready", subject, message)
        NotificationService.create_in_app(user, "roadmap_ready", subject, message)
