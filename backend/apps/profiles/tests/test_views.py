"""Tests for profiles API views."""
import pytest
from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.tests.factories import UserFactory
from apps.profiles.models import StartupProfile
from apps.profiles.tests.factories import StartupProfileFactory, CompletedProfileFactory


@pytest.fixture
def user():
    u = UserFactory()
    u.set_password("TestPass123!")
    u.save()
    return u


@pytest.fixture
def auth_client(user):
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    client._user = user
    return client


@pytest.mark.django_db
class TestStartupProfileView:
    """Tests for GET/PUT/PATCH /api/v1/profile/."""

    def test_get_creates_profile_on_first_access(self, auth_client):
        response = auth_client.get(reverse("profiles:profile"))
        assert response.status_code == status.HTTP_200_OK
        assert StartupProfile.objects.filter(user=auth_client._user).exists()

    def test_get_returns_existing_profile(self, auth_client):
        profile = StartupProfileFactory(user=auth_client._user, sector="health")
        response = auth_client.get(reverse("profiles:profile"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["sector"] == "health"

    def test_patch_updates_profile(self, auth_client):
        StartupProfileFactory(user=auth_client._user)
        response = auth_client.patch(
            reverse("profiles:profile"),
            {"sector": "finance", "city": "Abuja"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["sector"] == "finance"
        assert response.data["city"] == "Abuja"

    def test_requires_authentication(self):
        client = APIClient()
        response = client.get(reverse("profiles:profile"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_put_updates_full_profile(self, auth_client, user):
        StartupProfileFactory(user=user)
        from apps.profiles.models import DEFAULT_AVAILABLE_RESOURCES
        payload = {
            "sector": "ai",
            "background_story": "I have worked in AI for 5 years.",
            "problem": "Companies can't use AI effectively.",
            "country": "Nigeria",
            "state": "Lagos",
            "city": "Lagos",
            "existing_experience": "AI consulting",
            "key_skills": ["Python", "ML"],
            "available_resources": DEFAULT_AVAILABLE_RESOURCES,
            "team_status": "solo",
            "time_commitment": "full",
        }
        response = auth_client.put(reverse("profiles:profile"), payload, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["sector"] == "ai"


@pytest.mark.django_db
class TestCompleteOnboardingView:
    """Tests for POST /api/v1/profile/complete-onboarding/."""

    @patch("apps.profiles.tasks.generate_startup_report_and_roadmap.delay")
    @patch("apps.notifications.tasks.send_verification_email_task.delay")
    def test_completes_onboarding_and_queues_task(self, mock_verify, mock_gen, auth_client):
        from apps.profiles.models import DEFAULT_AVAILABLE_RESOURCES
        StartupProfileFactory(
            user=auth_client._user,
            sector="technology",
            background_story="My story",
            problem="A real problem",
            country="Nigeria",
            city="Lagos",
            team_status="solo",
            time_commitment="full",
            available_resources=DEFAULT_AVAILABLE_RESOURCES,
        )
        response = auth_client.post(reverse("profiles:complete-onboarding"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["generation_status"] == "pending"
        mock_gen.assert_called_once()

    @patch("apps.profiles.tasks.generate_startup_report_and_roadmap.delay")
    @patch("apps.notifications.tasks.send_verification_email_task.delay")
    def test_idempotent_if_already_completed(self, mock_verify, mock_gen, auth_client):
        CompletedProfileFactory(user=auth_client._user)
        response = auth_client.post(reverse("profiles:complete-onboarding"))
        assert response.status_code == status.HTTP_200_OK
        mock_gen.assert_not_called()

    def test_fails_for_incomplete_profile(self, auth_client):
        """Onboarding should fail if required fields are missing."""
        StartupProfileFactory(
            user=auth_client._user,
            sector="",
            background_story="",
            problem="",
            country="",
            city="",
            team_status="",
            time_commitment="",
        )
        response = auth_client.post(reverse("profiles:complete-onboarding"))
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestProfileStatusView:
    """Tests for GET /api/v1/profile/status/."""

    def test_returns_generation_status(self, auth_client):
        StartupProfileFactory(user=auth_client._user, generation_status="processing")
        response = auth_client.get(reverse("profiles:status"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["generation_status"] == "processing"
