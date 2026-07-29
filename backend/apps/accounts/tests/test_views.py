"""Tests for accounts API views."""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import EmailVerificationToken, PasswordResetToken
from apps.accounts.tests.factories import (
    EmailVerificationTokenFactory,
    PasswordResetTokenFactory,
    UserFactory,
    VerifiedUserFactory,
)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_client(api_client):
    """Return an APIClient authenticated as a regular user."""
    user = VerifiedUserFactory()
    user.set_password("TestPass123!")
    user.save()
    response = api_client.post(
        reverse("accounts:login"),
        {"email": user.email, "password": "TestPass123!"},
        format="json",
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
    api_client._user = user
    return api_client


@pytest.mark.django_db
class TestRegisterView:
    """Tests for POST /api/v1/auth/register/."""

    def test_registration_succeeds(self, api_client):
        response = api_client.post(
            reverse("accounts:register"),
            {
                "email": "newuser@example.com",
                "full_name": "New User",
                "password": "StrongPass1!",
                "password_confirm": "StrongPass1!",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["email"] == "newuser@example.com"

    def test_registration_duplicate_email_fails(self, api_client):
        UserFactory(email="taken@example.com")
        response = api_client.post(
            reverse("accounts:register"),
            {
                "email": "taken@example.com",
                "full_name": "Dup User",
                "password": "StrongPass1!",
                "password_confirm": "StrongPass1!",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_registration_missing_fields_fails(self, api_client):
        response = api_client.post(
            reverse("accounts:register"),
            {"email": "partial@example.com"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLoginView:
    """Tests for POST /api/v1/auth/login/."""

    def test_login_returns_tokens(self, api_client):
        user = UserFactory()
        user.set_password("TestPass123!")
        user.save()
        response = api_client.post(
            reverse("accounts:login"),
            {"email": user.email, "password": "TestPass123!"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_wrong_password_fails(self, api_client):
        user = UserFactory()
        response = api_client.post(
            reverse("accounts:login"),
            {"email": user.email, "password": "wrongpassword"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_inactive_user_fails(self, api_client):
        user = UserFactory(is_active=False)
        user.set_password("TestPass123!")
        user.save()
        response = api_client.post(
            reverse("accounts:login"),
            {"email": user.email, "password": "TestPass123!"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestMeView:
    """Tests for GET /api/v1/auth/me/."""

    def test_returns_user_data(self, auth_client):
        response = auth_client.get(reverse("accounts:me"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == auth_client._user.email

    def test_requires_authentication(self, api_client):
        response = api_client.get(reverse("accounts:me"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestLogoutView:
    """Tests for POST /api/v1/auth/logout/."""

    def test_logout_blacklists_refresh_token(self, api_client):
        user = VerifiedUserFactory()
        user.set_password("TestPass123!")
        user.save()
        login = api_client.post(
            reverse("accounts:login"),
            {"email": user.email, "password": "TestPass123!"},
            format="json",
        )
        refresh = login.data["refresh"]
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
        response = api_client.post(
            reverse("accounts:logout"),
            {"refresh": refresh},
            format="json",
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_logout_requires_authentication(self, api_client):
        response = api_client.post(reverse("accounts:logout"), {"refresh": "x"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestPasswordResetViews:
    """Tests for password reset flow."""

    def test_password_reset_request_always_returns_200(self, api_client):
        """Should return 200 even for unknown emails (anti-enumeration)."""
        response = api_client.post(
            reverse("accounts:password-reset-request"),
            {"email": "nobody@example.com"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

    def test_password_reset_confirm_succeeds(self, api_client):
        token_obj = PasswordResetTokenFactory()
        response = api_client.post(
            reverse("accounts:password-reset-confirm"),
            {
                "token": token_obj.token,
                "password": "BrandNewPass1!",
                "password_confirm": "BrandNewPass1!",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        token_obj.user.refresh_from_db()
        assert token_obj.user.check_password("BrandNewPass1!")

    def test_password_reset_confirm_invalid_token_fails(self, api_client):
        response = api_client.post(
            reverse("accounts:password-reset-confirm"),
            {
                "token": "badtoken",
                "password": "BrandNewPass1!",
                "password_confirm": "BrandNewPass1!",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestEmailVerifyView:
    """Tests for POST /api/v1/auth/verify-email/."""

    def test_valid_token_verifies_email(self, api_client):
        token_obj = EmailVerificationTokenFactory()
        assert token_obj.user.is_email_verified is False
        response = api_client.post(
            reverse("accounts:verify-email"),
            {"token": token_obj.token},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        token_obj.user.refresh_from_db()
        assert token_obj.user.is_email_verified is True

    def test_invalid_token_fails(self, api_client):
        response = api_client.post(
            reverse("accounts:verify-email"),
            {"token": "badtoken"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
