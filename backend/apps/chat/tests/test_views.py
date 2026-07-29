"""Tests for chat API views."""
import pytest
from unittest.mock import MagicMock, patch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.tests.factories import UserFactory
from apps.chat.tests.factories import AssistantMessageFactory, ConversationFactory, UserMessageFactory
from apps.profiles.tests.factories import CompletedProfileFactory


def make_auth_client(user):
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return client


@pytest.mark.django_db
class TestConversationListView:
    """Tests for GET /api/v1/chat/conversations/."""

    def test_returns_user_conversations(self):
        conv = ConversationFactory()
        client = make_auth_client(conv.user)
        response = client.get(reverse("chat:conversations"))
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_does_not_return_other_users_conversations(self):
        conv = ConversationFactory()
        other_user = UserFactory()
        client = make_auth_client(other_user)
        response = client.get(reverse("chat:conversations"))
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0

    def test_requires_authentication(self):
        response = APIClient().get(reverse("chat:conversations"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestSendMessageView:
    """Tests for POST /api/v1/chat/messages/."""

    @patch("apps.ai.services.AIProviderFactory.get_provider")
    def test_sends_message_and_returns_assistant_response(self, mock_factory):
        mock_provider = MagicMock()
        mock_provider.chat.return_value = "Here is my advice for your startup."
        mock_factory.return_value = mock_provider

        user = UserFactory()
        CompletedProfileFactory(user=user)
        client = make_auth_client(user)

        response = client.post(
            reverse("chat:send-message"),
            {"message": "What should I prioritise this week?"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["role"] == "assistant"
        assert "advice" in response.data["content"]

    def test_empty_message_fails(self):
        user = UserFactory()
        CompletedProfileFactory(user=user)
        client = make_auth_client(user)
        response = client.post(
            reverse("chat:send-message"),
            {"message": "   "},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_requires_completed_onboarding(self):
        from apps.profiles.tests.factories import StartupProfileFactory
        user = UserFactory()
        StartupProfileFactory(user=user, onboarding_completed=False)
        client = make_auth_client(user)
        response = client.post(
            reverse("chat:send-message"),
            {"message": "Hello"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_requires_authentication(self):
        response = APIClient().post(
            reverse("chat:send-message"),
            {"message": "Hello"},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestMessageListView:
    """Tests for GET /api/v1/chat/messages/history/."""

    def test_returns_message_history(self):
        conv = ConversationFactory()
        UserMessageFactory(conversation=conv, content="First message")
        AssistantMessageFactory(conversation=conv, content="First reply")
        client = make_auth_client(conv.user)
        response = client.get(reverse("chat:message-list"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 2

    def test_returns_empty_results_for_no_conversation(self):
        user = UserFactory()
        CompletedProfileFactory(user=user)
        client = make_auth_client(user)
        response = client.get(reverse("chat:message-list"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 0
