"""Tests for accounts serializers."""
import pytest

from apps.accounts.serializers import (
    LoginSerializer,
    PasswordResetConfirmSerializer,
    RegisterSerializer,
)
from apps.accounts.tests.factories import PasswordResetTokenFactory, UserFactory


@pytest.mark.django_db
class TestRegisterSerializer:
    """Tests for RegisterSerializer validation and user creation."""

    def _valid_payload(self, **overrides):
        base = {
            "email": "new@example.com",
            "full_name": "New User",
            "password": "StrongPass1!",
            "password_confirm": "StrongPass1!",
        }
        base.update(overrides)
        return base

    def test_valid_data_is_accepted(self):
        s = RegisterSerializer(data=self._valid_payload())
        assert s.is_valid(), s.errors

    def test_password_mismatch_raises_error(self):
        s = RegisterSerializer(data=self._valid_payload(password_confirm="wrong"))
        assert not s.is_valid()
        assert "password_confirm" in s.errors

    def test_duplicate_email_raises_error(self):
        UserFactory(email="existing@example.com")
        s = RegisterSerializer(data=self._valid_payload(email="existing@example.com"))
        assert not s.is_valid()
        assert "email" in s.errors

    def test_weak_password_raises_error(self):
        s = RegisterSerializer(data=self._valid_payload(password="123", password_confirm="123"))
        assert not s.is_valid()
        assert "password" in s.errors

    def test_create_returns_user_instance(self):
        s = RegisterSerializer(data=self._valid_payload())
        s.is_valid(raise_exception=True)
        user = s.save()
        assert user.email == "new@example.com"
        assert user.check_password("StrongPass1!")


@pytest.mark.django_db
class TestLoginSerializer:
    """Tests for LoginSerializer authentication."""

    def test_valid_credentials_return_tokens(self):
        user = UserFactory()
        user.set_password("TestPass123!")
        user.save()
        s = LoginSerializer(data={"email": user.email, "password": "TestPass123!"})
        assert s.is_valid(), s.errors
        assert "access" in s.validated_data
        assert "refresh" in s.validated_data

    def test_wrong_password_fails(self):
        user = UserFactory()
        s = LoginSerializer(data={"email": user.email, "password": "wrongpass"})
        assert not s.is_valid()

    def test_nonexistent_email_fails(self):
        s = LoginSerializer(data={"email": "ghost@example.com", "password": "pass"})
        assert not s.is_valid()


@pytest.mark.django_db
class TestPasswordResetConfirmSerializer:
    """Tests for PasswordResetConfirmSerializer."""

    def test_valid_token_and_matching_passwords(self):
        token_obj = PasswordResetTokenFactory()
        s = PasswordResetConfirmSerializer(
            data={
                "token": token_obj.token,
                "password": "NewStrongPass1!",
                "password_confirm": "NewStrongPass1!",
            }
        )
        assert s.is_valid(), s.errors
        assert s.validated_data["token_obj"] == token_obj

    def test_invalid_token_fails(self):
        s = PasswordResetConfirmSerializer(
            data={
                "token": "nonexistenttoken",
                "password": "NewStrongPass1!",
                "password_confirm": "NewStrongPass1!",
            }
        )
        assert not s.is_valid()

    def test_password_mismatch_fails(self):
        token_obj = PasswordResetTokenFactory()
        s = PasswordResetConfirmSerializer(
            data={
                "token": token_obj.token,
                "password": "NewStrongPass1!",
                "password_confirm": "Different1!",
            }
        )
        assert not s.is_valid()
        assert "password_confirm" in s.errors

    def test_used_token_fails(self):
        token_obj = PasswordResetTokenFactory(is_used=True)
        s = PasswordResetConfirmSerializer(
            data={
                "token": token_obj.token,
                "password": "NewStrongPass1!",
                "password_confirm": "NewStrongPass1!",
            }
        )
        assert not s.is_valid()
