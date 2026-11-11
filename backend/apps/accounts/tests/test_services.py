"""Tests for accounts services."""
import pytest
from unittest.mock import MagicMock, patch

from apps.accounts.models import PasswordResetToken, User
from apps.accounts.services import (
    confirm_password_reset,
    register_user,
    request_password_reset,
    verify_email,
)
from apps.accounts.tests.factories import (
    EmailVerificationTokenFactory,
    PasswordResetTokenFactory,
    UserFactory,
)


@pytest.mark.django_db(transaction=True)
class TestRegisterUser:
    """Tests for the register_user service."""

    @patch("apps.notifications.tasks.send_welcome_email_task.delay")
    def test_creates_user(self, mock_task):
        user = register_user("test@example.com", "Pass1234!", "Test User")
        assert User.objects.filter(email="test@example.com").exists()
        assert user.full_name == "Test User"

    @patch("apps.notifications.tasks.send_welcome_email_task.delay")
    def test_dispatches_welcome_email_task(self, mock_task):
        user = register_user("new@example.com", "Pass1234!", "New")
        mock_task.assert_called_once_with(user.id)

    @patch("apps.notifications.tasks.send_welcome_email_task.delay")
    def test_password_is_hashed(self, mock_task):
        user = register_user("hash@example.com", "Pass1234!", "Hash")
        assert user.check_password("Pass1234!")
        assert user.password != "Pass1234!"


@pytest.mark.django_db(transaction=True)
class TestRequestPasswordReset:
    """Tests for the request_password_reset service."""

    @patch("apps.notifications.tasks.send_password_reset_email_task.delay")
    def test_creates_token_for_known_email(self, mock_task):
        user = UserFactory()
        request_password_reset(user.email)
        assert PasswordResetToken.objects.filter(user=user, is_used=False).exists()
        mock_task.assert_called_once()

    @patch("apps.notifications.tasks.send_password_reset_email_task.delay")
    def test_silently_ignores_unknown_email(self, mock_task):
        """No exception for unknown email; no task dispatched."""
        request_password_reset("nobody@example.com")
        mock_task.assert_not_called()

    @patch("apps.notifications.tasks.send_password_reset_email_task.delay")
    def test_invalidates_old_tokens(self, mock_task):
        user = UserFactory()
        old_token = PasswordResetTokenFactory(user=user)
        request_password_reset(user.email)
        # Old unused token must be removed
        assert not PasswordResetToken.objects.filter(pk=old_token.pk).exists()


@pytest.mark.django_db
class TestConfirmPasswordReset:
    """Tests for the confirm_password_reset service."""

    def test_updates_password_and_marks_token_used(self):
        token_obj = PasswordResetTokenFactory()
        confirm_password_reset(token_obj, "BrandNewPass1!")
        token_obj.user.refresh_from_db()
        token_obj.refresh_from_db()
        assert token_obj.user.check_password("BrandNewPass1!")
        assert token_obj.is_used is True


@pytest.mark.django_db
class TestVerifyEmail:
    """Tests for the verify_email service."""

    def test_marks_user_email_as_verified(self):
        token_obj = EmailVerificationTokenFactory()
        verify_email(token_obj.token)
        token_obj.user.refresh_from_db()
        assert token_obj.user.is_email_verified is True

    def test_deletes_token_after_verification(self):
        from apps.accounts.models import EmailVerificationToken
        token_obj = EmailVerificationTokenFactory()
        token_str = token_obj.token
        verify_email(token_str)
        assert not EmailVerificationToken.objects.filter(token=token_str).exists()

    def test_invalid_token_raises_value_error(self):
        with pytest.raises(ValueError, match="Invalid or expired"):
            verify_email("badtoken")

    def test_expired_token_raises_value_error(self):
        from datetime import timedelta
        from django.utils import timezone
        token_obj = EmailVerificationTokenFactory()
        token_obj.expires_at = timezone.now() - timedelta(hours=1)
        token_obj.save()
        with pytest.raises(ValueError, match="Invalid or expired"):
            verify_email(token_obj.token)
