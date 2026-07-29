"""Tests for validation API views."""
import pytest
from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.tests.factories import UserFactory
from apps.profiles.tests.factories import CompletedProfileFactory
from apps.validation.tests.factories import ValidationReportFactory


@pytest.fixture
def user_with_report():
    user = UserFactory()
    profile = CompletedProfileFactory(user=user)
    report = ValidationReportFactory(profile=profile)
    return user, profile, report


@pytest.fixture
def auth_client_for(user_with_report):
    user, profile, report = user_with_report
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    client._user = user
    return client, profile, report


@pytest.mark.django_db
class TestValidationReportView:
    """Tests for GET /api/v1/validation-report/."""

    def test_returns_report_for_authenticated_user(self, auth_client_for):
        client, profile, report = auth_client_for
        response = client.get(reverse("validation:report"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["score"] == report.score

    def test_returns_404_when_no_profile(self):
        user = UserFactory()
        client = APIClient()
        refresh = RefreshToken.for_user(user)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
        response = client.get(reverse("validation:report"))
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_returns_404_when_report_not_generated(self):
        user = UserFactory()
        CompletedProfileFactory(user=user)
        client = APIClient()
        refresh = RefreshToken.for_user(user)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
        response = client.get(reverse("validation:report"))
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_requires_authentication(self):
        client = APIClient()
        response = client.get(reverse("validation:report"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @patch("apps.validation.views.cache")
    def test_returns_cached_response_on_second_call(self, mock_cache, auth_client_for):
        client, profile, report = auth_client_for
        mock_cache.get.return_value = {"score": 99, "cached": True}
        response = client.get(reverse("validation:report"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["score"] == 99
