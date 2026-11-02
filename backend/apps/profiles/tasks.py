"""
Celery tasks for the profiles app.

Tasks:
    generate_startup_report_and_roadmap – Orchestrates AI report + roadmap generation.
"""
import logging

from celery import shared_task
from django.db import transaction

logger = logging.getLogger(__name__)

# Retry schedule: 60s, 300s, 900s
RETRY_COUNTDOWN = [60, 300, 900]


@shared_task(
    bind=True,
    max_retries=3,
    name="profiles.generate_startup_report_and_roadmap",
    acks_late=True,
)
def generate_startup_report_and_roadmap(self, profile_id: int) -> None:
    """
    Orchestrate the full AI generation pipeline for a startup profile:
        1. Fetch the profile and set status to 'processing'.
        2. Generate and save the Validation Report.
        3. Generate and save the Roadmap (using the report data).
        4. Set status to 'completed'.
        5. Send in-app and email notifications to the user.

    On failure, retries with exponential back-off up to 3 times.
    After all retries are exhausted, status is set to 'failed'.

    Args:
        profile_id: Primary key of the StartupProfile to process.
    """
    from apps.profiles.models import StartupProfile
    from apps.roadmaps.services import generate_roadmap
    from apps.validation.services import generate_validation_report

    try:
        profile = StartupProfile.objects.select_related("user").get(pk=profile_id)
    except StartupProfile.DoesNotExist:
        logger.error("generate_startup_report_and_roadmap: profile %s not found.", profile_id)
        return

    # ── Step 1: Mark as processing ───────────────────────────────────────────
    profile.generation_status = "processing"
    profile.generation_error = ""
    profile.save(update_fields=["generation_status", "generation_error", "updated_at"])
    logger.info("AI generation started for profile %s", profile_id)

    try:
        # ── Step 2: Generate Validation Report ───────────────────────────────
        report = generate_validation_report(profile)
        logger.info("Validation report generated for profile %s", profile_id)

        # ── Step 3: Generate Roadmap ──────────────────────────────────────────
        generate_roadmap(profile, report)
        logger.info("Roadmap generated for profile %s", profile_id)

        # ── Step 4: Mark as completed ─────────────────────────────────────────
        with transaction.atomic():
            profile.generation_status = "completed"
            profile.save(update_fields=["generation_status", "updated_at"])

        # ── Step 5: Notify the user ───────────────────────────────────────────
        _notify_user_generation_complete(profile)
        logger.info("AI generation completed for profile %s", profile_id)

    except Exception as exc:
        retry_number = self.request.retries
        logger.warning(
            "AI generation failed for profile %s (attempt %s/%s): %s",
            profile_id,
            retry_number + 1,
            self.max_retries + 1,
            exc,
        )

        if retry_number < self.max_retries:
            # Schedule retry with exponential back-off
            countdown = RETRY_COUNTDOWN[min(retry_number, len(RETRY_COUNTDOWN) - 1)]
            # Reset to pending so the status shows retrying
            profile.generation_status = "pending"
            profile.save(update_fields=["generation_status", "updated_at"])
            raise self.retry(exc=exc, countdown=countdown)
        else:
            # All retries exhausted
            _mark_generation_failed(profile, exc)


def _notify_user_generation_complete(profile) -> None:
    """Send in-app and email notifications when generation completes."""
    from apps.notifications.services import NotificationService

    NotificationService.notify_report_ready(profile.user)
    NotificationService.notify_roadmap_ready(profile.user)


def _mark_generation_failed(profile, exc: Exception) -> None:
    """Set the generation status to failed and store the error message."""
    error_message = str(exc)[:1000]  # Truncate to prevent DB overflow
    profile.generation_status = "failed"
    profile.generation_error = error_message
    profile.save(update_fields=["generation_status", "generation_error", "updated_at"])
    logger.error(
        "AI generation permanently failed for profile %s: %s",
        profile.id,
        error_message,
    )
