"""Tests for notification services."""
import pytest
from unittest.mock import patch, MagicMock

from apps.accounts.tests.factories import UserFactory
from apps.notifications.models import Notification
from apps.notifications.services import NotificationService


@pytest.mark.django_db
class TestNotificationService:
    """Tests for NotificationService methods."""

    @patch("apps.notifications.services.send_email")
    def test_notify_welcome_creates_in_app_and_email_records(self, mock_send):
        mock_send.return_value = True
        user = UserFactory()
        NotificationService.notify_welcome(user)

        assert Notification.objects.filter(user=user, category="welcome", type="in_app").exists()
        assert Notification.objects.filter(user=user, category="welcome", type="email").exists()

    @patch("apps.notifications.services.send_email")
    def test_notify_report_ready_creates_in_app_notification(self, mock_send):
        mock_send.return_value = True
        user = UserFactory()
        NotificationService.notify_report_ready(user)

        notif = Notification.objects.get(user=user, category="report_ready", type="in_app")
        assert notif.is_read is False

    @patch("apps.notifications.services.send_email")
    def test_notify_verification_does_not_create_in_app(self, mock_send):
        """Verification email should only create email record, not in-app."""
        mock_send.return_value = True
        user = UserFactory()
        NotificationService.notify_verification(user, "testtoken123")

        assert Notification.objects.filter(user=user, category="verification", type="email").exists()
        assert not Notification.objects.filter(user=user, category="verification", type="in_app").exists()

    @patch("apps.notifications.services.send_email")
    def test_notify_password_reset_sends_email(self, mock_send):
        mock_send.return_value = True
        user = UserFactory()
        NotificationService.notify_password_reset(user, "resettoken")
        mock_send.assert_called_once()

    @patch("apps.notifications.services.send_email")
    def test_create_in_app_sets_is_read_false(self, mock_send):
        user = UserFactory()
        notif = NotificationService.create_in_app(
            user, "report_ready", "Report ready!", "Your report is done."
        )
        assert notif.is_read is False
        assert notif.type == "in_app"
