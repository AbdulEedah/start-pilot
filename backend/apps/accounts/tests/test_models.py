"""Tests for accounts models."""
import pytest
from django.utils import timezone
from freezegun import freeze_time

from apps.accounts.models import EmailVerificationToken, PasswordResetToken, User

from .factories import (
    EmailVerificationTokenFactory,
    PasswordResetTokenFactory,
    UserFactory,
    VerifiedUserFactory,
)


@pytest.mark.django_db
class TestUserModel:
    """Tests for the custom User model."""

    def test_create_user_email_as_identifier(self):
        """User.USERNAME_FIELD must be 'email'."""
        assert User.USERNAME_FIELD == "email"

    def test_create_user_stores_hashed_password(self):
        """set_password must hash the raw password."""
        user = UserFactory(password=None)
        user.set_password("SecurePass123!")
        assert user.check_password("SecurePass123!")
        assert user.password != "SecurePass123!"

    def test_create_user_via_manager(self):
        """create_user must normalise email and save correctly."""
        user = User.objects.create_user(
            email="Test@Example.COM",
            password="pass",
            full_name="Test User",
        )
        assert user.email == "test@example.com"
        assert user.is_staff is False
        assert user.is_superuser is False

    def test_create_superuser(self):
        """create_superuser must set is_staff and is_superuser."""
        user = User.objects.create_superuser(
            email="admin@example.com",
            password="adminpass",
            full_name="Admin",
        )
        assert user.is_staff is True
        assert user.is_superuser is True
        assert user.is_email_verified is True

    def test_str_representation(self):
        """__str__ should include full name and email."""
        user = UserFactory(full_name="Jane Doe", email="jane@example.com")
        assert "Jane Doe" in str(user)
        assert "jane@example.com" in str(user)

    def test_first_name_display_property(self):
        """first_name_display should return the first word of full_name."""
        user = UserFactory(full_name="Alice Smith")
        assert user.first_name_display == "Alice"

    def test_first_name_display_empty_full_name(self):
        """first_name_display must handle empty full_name gracefully."""
        user_obj = User(full_name="")
        assert user_obj.first_name_display == ""

    def test_email_is_unique(self):
        """Two users with the same email must raise IntegrityError."""
        import pytest
        from django.db import IntegrityError

        UserFactory(email="dup@example.com")
        with pytest.raises(IntegrityError):
            UserFactory(email="dup@example.com")


@pytest.mark.django_db
class TestEmailVerificationToken:
    """Tests for the EmailVerificationToken model."""

    def test_token_is_auto_generated(self):
        """Token value must be set automatically on save."""
        token = EmailVerificationTokenFactory()
        assert token.token
        assert len(token.token) > 20

    def test_expires_at_is_set_automatically(self):
        """expires_at must default to 24 hours from now."""
        before = timezone.now()
        token = EmailVerificationTokenFactory()
        after = timezone.now()
        delta = token.expires_at - before
        assert 0 < delta.total_seconds() <= 86400 + 5  # 24h + small buffer

    def test_is_expired_false_for_fresh_token(self):
        """Fresh token must not be expired."""
        token = EmailVerificationTokenFactory()
        assert token.is_expired is False

    @freeze_time("2024-01-01 12:00:00")
    def test_is_expired_true_after_expiry(self):
        """Token must be expired after its expires_at datetime."""
        from datetime import timedelta

        token = EmailVerificationTokenFactory()
        token.expires_at = timezone.now() - timedelta(seconds=1)
        assert token.is_expired is True

    def test_str_representation(self):
        """__str__ should include the user email."""
        token = EmailVerificationTokenFactory()
        assert token.user.email in str(token)


@pytest.mark.django_db
class TestPasswordResetToken:
    """Tests for the PasswordResetToken model."""

    def test_is_valid_true_for_fresh_token(self):
        """Unused, unexpired token must be valid."""
        token = PasswordResetTokenFactory()
        assert token.is_valid is True

    def test_is_valid_false_when_used(self):
        """Used token must not be valid."""
        token = PasswordResetTokenFactory(is_used=True)
        assert token.is_valid is False

    @freeze_time("2024-01-01 12:00:00")
    def test_is_valid_false_when_expired(self):
        """Expired token must not be valid."""
        from datetime import timedelta

        token = PasswordResetTokenFactory()
        token.expires_at = timezone.now() - timedelta(seconds=1)
        assert token.is_valid is False

    def test_token_uniqueness(self):
        """Each PasswordResetToken must have a unique token value."""
        t1 = PasswordResetTokenFactory()
        t2 = PasswordResetTokenFactory()
        assert t1.token != t2.token
