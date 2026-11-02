"""
Celery tasks for the notifications app.

Tasks:
    send_welcome_email_task          – Send welcome email after registration.
    send_verification_email_task     – Send email verification link.
    send_password_reset_email_task   – Send password reset link.
    send_report_ready_email_task     – Notify user their report is ready.
    send_roadmap_ready_email_task    – Notify user their roadmap is ready.
"""
import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    name="notifications.send_welcome_email",
    default_retry_delay=60,
)
def send_welcome_email_task(self, user_id: int) -> None:
    """
    Asynchronously send a welcome email to a newly registered user.

    Args:
        user_id: Primary key of the User to notify.
    """
    from apps.accounts.models import User
    from apps.notifications.services import NotificationService

    try:
        user = User.objects.get(pk=user_id)
        NotificationService.notify_welcome(user)
        logger.info("Welcome email sent to user %s", user_id)
    except User.DoesNotExist:
        logger.error("send_welcome_email_task: user %s not found", user_id)
    except Exception as exc:
        logger.warning("Welcome email failed for user %s: %s – retrying", user_id, exc)
        raise self.retry(exc=exc)


@shared_task(
    bind=True,
    max_retries=3,
    name="notifications.send_verification_email",
    default_retry_delay=60,
)
def send_verification_email_task(self, user_id: int, token: str) -> None:
    """
    Asynchronously send an email verification link.

    Args:
        user_id: Primary key of the User to verify.
        token:   Raw verification token string.
    """
    from apps.accounts.models import User
    from apps.notifications.services import NotificationService

    try:
        user = User.objects.get(pk=user_id)
        NotificationService.notify_verification(user, token)
        logger.info("Verification email sent to user %s", user_id)
    except User.DoesNotExist:
        logger.error("send_verification_email_task: user %s not found", user_id)
    except Exception as exc:
        logger.warning("Verification email failed for user %s: %s – retrying", user_id, exc)
        raise self.retry(exc=exc)


@shared_task(
    bind=True,
    max_retries=3,
    name="notifications.send_password_reset_email",
    default_retry_delay=60,
)
def send_password_reset_email_task(self, user_id: int, token: str) -> None:
    """
    Asynchronously send a password-reset link.

    Args:
        user_id: Primary key of the User requesting a reset.
        token:   Raw password-reset token string.
    """
    from apps.accounts.models import User
    from apps.notifications.services import NotificationService

    try:
        user = User.objects.get(pk=user_id)
        NotificationService.notify_password_reset(user, token)
        logger.info("Password reset email sent to user %s", user_id)
    except User.DoesNotExist:
        logger.error("send_password_reset_email_task: user %s not found", user_id)
    except Exception as exc:
        logger.warning("Password reset email failed for user %s: %s – retrying", user_id, exc)
        raise self.retry(exc=exc)


@shared_task(
    bind=True,
    max_retries=3,
    name="notifications.send_report_ready_email",
    default_retry_delay=60,
)
def send_report_ready_email_task(self, user_id: int) -> None:
    """
    Notify a user that their validation report is ready.

    Args:
        user_id: Primary key of the User to notify.
    """
    from apps.accounts.models import User
    from apps.notifications.services import NotificationService

    try:
        user = User.objects.get(pk=user_id)
        NotificationService.notify_report_ready(user)
        logger.info("Report-ready email sent to user %s", user_id)
    except User.DoesNotExist:
        logger.error("send_report_ready_email_task: user %s not found", user_id)
    except Exception as exc:
        logger.warning("Report-ready email failed for user %s: %s – retrying", user_id, exc)
        raise self.retry(exc=exc)


@shared_task(
    bind=True,
    max_retries=3,
    name="notifications.send_roadmap_ready_email",
    default_retry_delay=60,
)
def send_roadmap_ready_email_task(self, user_id: int) -> None:
    """
    Notify a user that their roadmap is ready.

    Args:
        user_id: Primary key of the User to notify.
    """
    from apps.accounts.models import User
    from apps.notifications.services import NotificationService

    try:
        user = User.objects.get(pk=user_id)
        NotificationService.notify_roadmap_ready(user)
        logger.info("Roadmap-ready email sent to user %s", user_id)
    except User.DoesNotExist:
        logger.error("send_roadmap_ready_email_task: user %s not found", user_id)
    except Exception as exc:
        logger.warning("Roadmap-ready email failed for user %s: %s – retrying", user_id, exc)
        raise self.retry(exc=exc)
