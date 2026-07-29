"""Tests for notifications API views."""
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.tests.factories import UserFactory
from apps.notifications.tests.factories import InAppNotificationFactory


def make_auth_client(user):
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return client


@pytest.mark.django_db
class TestNotificationListView:
    """Tests for GET /api/v1/notifications/."""

    def test_returns_only_in_app_notifications(self):
        user = UserFactory()
        InAppNotificationFactory(user=user)
        InAppNotificationFactory(user=user, type="email")  # should be excluded
        client = make_auth_client(user)
        response = client.get(reverse("notifications:list"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_filters_by_is_read_false(self):
        user = UserFactory()
        InAppNotificationFactory(user=user, is_read=False)
        InAppNotificationFactory(user=user, is_read=True)
        client = make_auth_client(user)
        response = client.get(reverse("notifications:list") + "?is_read=false")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1
        assert response.data["results"][0]["is_read"] is False

    def test_does_not_return_other_users_notifications(self):
        user_a = UserFactory()
        user_b = UserFactory()
        InAppNotificationFactory(user=user_a)
        client = make_auth_client(user_b)
        response = client.get(reverse("notifications:list"))
        assert response.data["count"] == 0

    def test_requires_authentication(self):
        response = APIClient().get(reverse("notifications:list"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestMarkNotificationReadView:
    """Tests for PATCH /api/v1/notifications/{id}/read/."""

    def test_marks_notification_as_read(self):
        user = UserFactory()
        notif = InAppNotificationFactory(user=user, is_read=False)
        client = make_auth_client(user)
        response = client.patch(
            reverse("notifications:mark-read", kwargs={"notification_id": notif.pk})
        )
        assert response.status_code == status.HTTP_200_OK
        notif.refresh_from_db()
        assert notif.is_read is True

    def test_idempotent_marking_read(self):
        user = UserFactory()
        notif = InAppNotificationFactory(user=user, is_read=True)
        client = make_auth_client(user)
        response = client.patch(
            reverse("notifications:mark-read", kwargs={"notification_id": notif.pk})
        )
        assert response.status_code == status.HTTP_200_OK

    def test_cannot_mark_other_users_notification(self):
        user_a = UserFactory()
        user_b = UserFactory()
        notif = InAppNotificationFactory(user=user_a)
        client = make_auth_client(user_b)
        response = client.patch(
            reverse("notifications:mark-read", kwargs={"notification_id": notif.pk})
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
