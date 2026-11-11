"""Tests for profiles models."""
import pytest
from django.core.exceptions import ValidationError

from apps.profiles.models import DEFAULT_AVAILABLE_RESOURCES, StartupProfile
from apps.profiles.tests.factories import StartupProfileFactory


@pytest.mark.django_db
class TestStartupProfileModel:
    """Tests for StartupProfile model."""

    def test_str_representation(self):
        profile = StartupProfileFactory(sector="technology")
        assert "technology" in str(profile)
        assert profile.user.email in str(profile)

    def test_default_available_resources_populated_on_save(self):
        """available_resources must default to the structured template."""
        profile = StartupProfileFactory()
        assert "financial" in profile.available_resources
        assert "human" in profile.available_resources
        assert "assets" in profile.available_resources
        assert "time" in profile.available_resources

    def test_clean_raises_on_missing_resource_keys(self):
        """clean() must reject available_resources missing required keys."""
        profile_obj = StartupProfile(
            available_resources={"financial": {}}  # missing human, assets, time
        )
        with pytest.raises(ValidationError):
            profile_obj.clean()

    def test_is_generation_complete_property(self):
        profile = StartupProfileFactory(generation_status="completed")
        assert profile.is_generation_complete is True

    def test_is_generation_complete_false_when_pending(self):
        profile = StartupProfileFactory(generation_status="pending")
        assert profile.is_generation_complete is False

    def test_is_generation_failed_property(self):
        profile = StartupProfileFactory(generation_status="failed")
        assert profile.is_generation_failed is True

    def test_sector_choices_are_valid(self):
        """Each of the 12 sectors must be a valid choice."""
        valid_sectors = [s[0] for s in StartupProfile._meta.get_field("sector").choices]
        assert "technology" in valid_sectors
        assert "climate" in valid_sectors
        assert len(valid_sectors) == 12

    def test_sector_lock_rejects_change_after_onboarding(self):
        """Once onboarding is completed, changing sector must be rejected."""
        profile = StartupProfileFactory(sector="technology", onboarding_completed=True)
        profile.sector = "fintech"
        with pytest.raises(ValidationError) as exc:
            profile.clean()
        assert "permanently locked" in str(exc.value)
