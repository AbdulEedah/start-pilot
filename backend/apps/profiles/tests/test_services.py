"""Tests for profiles services."""
import pytest
from unittest.mock import patch

from apps.core.exceptions import OnboardingNotCompleteError
from apps.profiles.services import complete_onboarding, get_or_create_profile, update_profile
from apps.profiles.tests.factories import StartupProfileFactory
from apps.accounts.tests.factories import UserFactory
from apps.profiles.models import DEFAULT_AVAILABLE_RESOURCES


@pytest.mark.django_db
class TestGetOrCreateProfile:
    """Tests for get_or_create_profile."""

    def test_creates_profile_when_none_exists(self):
        user = UserFactory()
        profile, created = get_or_create_profile(user)
        assert created is True
        assert profile.user == user

    def test_returns_existing_profile(self):
        profile = StartupProfileFactory()
        returned, created = get_or_create_profile(profile.user)
        assert created is False
        assert returned.pk == profile.pk


@pytest.mark.django_db
class TestUpdateProfile:
    """Tests for update_profile."""

    def test_updates_fields(self):
        profile = StartupProfileFactory(sector="technology")
        updated = update_profile(profile, {"sector": "health", "city": "Kano"})
        profile.refresh_from_db()
        assert profile.sector == "health"
        assert profile.city == "Kano"


@pytest.mark.django_db
class TestCompleteOnboarding:
    """Tests for complete_onboarding."""

    def _full_profile(self, user):
        return StartupProfileFactory(
            user=user,
            sector="technology",
            background_story="Story",
            problem="Problem",
            country="Nigeria",
            city="Lagos",
            team_status="solo",
            time_commitment="full",
            available_resources=DEFAULT_AVAILABLE_RESOURCES,
        )

    @patch("apps.profiles.tasks.generate_startup_report_and_roadmap.delay")
    @patch("apps.notifications.tasks.send_verification_email_task.delay")
    def test_sets_onboarding_completed(self, mock_email, mock_task):
        user = UserFactory()
        profile = self._full_profile(user)
        updated = complete_onboarding(profile)
        assert updated.onboarding_completed is True
        assert updated.generation_status == "pending"

    @patch("apps.profiles.tasks.generate_startup_report_and_roadmap.delay")
    @patch("apps.notifications.tasks.send_verification_email_task.delay")
    def test_dispatches_generation_task(self, mock_email, mock_task):
        user = UserFactory()
        profile = self._full_profile(user)
        complete_onboarding(profile)
        mock_task.assert_called_once_with(profile.id)

    def test_raises_when_fields_missing(self):
        user = UserFactory()
        profile = StartupProfileFactory(
            user=user,
            sector="",
            problem="",
            background_story="",
            country="",
            city="",
            team_status="",
            time_commitment="",
        )
        with pytest.raises(OnboardingNotCompleteError):
            complete_onboarding(profile)
