"""
Business-logic services for the profiles app.

Services:
    get_or_create_profile   – Return (profile, created) for a user.
    update_profile          – Validate and save profile fields.
    complete_onboarding     – Mark onboarding done and trigger AI generation.
"""
import logging

from django.db import transaction

from apps.core.exceptions import OnboardingNotCompleteError

from .models import StartupProfile

logger = logging.getLogger(__name__)


def get_or_create_profile(user) -> tuple[StartupProfile, bool]:
    """
    Return the user's StartupProfile, creating an empty one if it doesn't exist.

    Args:
        user: Authenticated User instance.

    Returns:
        Tuple of (profile, created) where created is True on first access.
    """
    return StartupProfile.objects.get_or_create(
        user=user,
        defaults={
            "sector": "",
            "background_story": "",
            "problem": "",
            "country": "",
            "city": "",
        },
    )


@transaction.atomic
def update_profile(profile: StartupProfile, validated_data: dict) -> StartupProfile:
    """
    Update the startup profile with the provided validated data.

    Args:
        profile:        Existing StartupProfile instance.
        validated_data: Dict of validated field values from the serializer.

    Returns:
        Updated StartupProfile instance.
    """
    for field, value in validated_data.items():
        setattr(profile, field, value)
    profile.full_clean()
    profile.save()
    logger.info("StartupProfile updated for user %s", profile.user_id)
    return profile


@transaction.atomic
def complete_onboarding(profile: StartupProfile) -> StartupProfile:
    """
    Mark the startup profile's onboarding as complete and enqueue AI generation.

    This sets generation_status to 'pending' and dispatches the
    generate_startup_report_and_roadmap Celery task.

    Args:
        profile: The StartupProfile to complete onboarding for.

    Returns:
        Updated StartupProfile with onboarding_completed=True.

    Raises:
        OnboardingNotCompleteError: If required fields are missing.
    """
    _validate_profile_completeness(profile)

    profile.onboarding_completed = True
    profile.generation_status = "pending"
    profile.generation_error = ""
    profile.save(
        update_fields=["onboarding_completed", "generation_status", "generation_error", "updated_at"]
    )

    # Trigger async AI generation task
    from apps.profiles.tasks import generate_startup_report_and_roadmap

    generate_startup_report_and_roadmap.delay(profile.id)

    # Send email verification if not yet done
    _send_verification_email_if_needed(profile.user)

    logger.info(
        "Onboarding completed for user %s – generation task queued.", profile.user_id
    )
    return profile


def _validate_profile_completeness(profile: StartupProfile) -> None:
    """
    Raise OnboardingNotCompleteError if any required onboarding fields are blank.

    Args:
        profile: StartupProfile to validate.
    """
    required_fields = {
        "sector": "Sector",
        "background_story": "Background story",
        "problem": "Problem statement",
        "country": "Country",
        "city": "City",
        "team_status": "Team status",
        "time_commitment": "Time commitment",
    }
    missing = [label for field, label in required_fields.items() if not getattr(profile, field)]
    if missing:
        raise OnboardingNotCompleteError(
            detail=f"Please fill in the following fields before completing onboarding: "
                   f"{', '.join(missing)}."
        )


def _send_verification_email_if_needed(user) -> None:
    """
    If the user has not yet verified their email, create a verification
    token and dispatch the verification email task.
    """
    if user.is_email_verified:
        return

    from apps.accounts.services import create_email_verification_token
    from apps.notifications.tasks import send_verification_email_task

    token = create_email_verification_token(user)
    send_verification_email_task.delay(user.id, token.token)
    logger.info("Verification email queued for user %s", user.id)
