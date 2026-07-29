"""Tests for chat services."""
import pytest
from unittest.mock import MagicMock, patch

from apps.chat.models import Conversation, Message
from apps.chat.services import (
    get_conversation_history,
    get_or_create_conversation,
    send_message,
)
from apps.chat.tests.factories import AssistantMessageFactory, ConversationFactory, UserMessageFactory
from apps.core.exceptions import AIGenerationError
from apps.profiles.tests.factories import CompletedProfileFactory
from apps.accounts.tests.factories import UserFactory


@pytest.mark.django_db
class TestGetOrCreateConversation:
    """Tests for get_or_create_conversation."""

    def test_creates_new_conversation(self):
        user = UserFactory()
        profile = CompletedProfileFactory(user=user)
        conv, created = get_or_create_conversation(user, profile)
        assert created is True
        assert conv.user == user
        assert conv.profile == profile

    def test_returns_existing_conversation(self):
        conv = ConversationFactory()
        returned, created = get_or_create_conversation(conv.user, conv.profile)
        assert created is False
        assert returned.pk == conv.pk


@pytest.mark.django_db
class TestGetConversationHistory:
    """Tests for get_conversation_history."""

    def test_returns_messages_oldest_first(self):
        conv = ConversationFactory()
        UserMessageFactory(conversation=conv, content="Hello")
        AssistantMessageFactory(conversation=conv, content="Hi there")
        history = get_conversation_history(conv)
        assert history[0]["role"] == "user"
        assert history[1]["role"] == "assistant"

    def test_respects_limit(self):
        conv = ConversationFactory()
        for i in range(15):
            UserMessageFactory(conversation=conv, content=f"msg {i}")
        history = get_conversation_history(conv, limit=5)
        assert len(history) == 5

    def test_returns_empty_list_for_new_conversation(self):
        conv = ConversationFactory()
        history = get_conversation_history(conv)
        assert history == []


@pytest.mark.django_db
class TestSendMessage:
    """Tests for send_message."""

    @patch("apps.ai.services.AIProviderFactory.get_provider")
    def test_creates_user_and_assistant_messages(self, mock_factory):
        mock_provider = MagicMock()
        mock_provider.chat.return_value = "Great question! Here is my advice."
        mock_factory.return_value = mock_provider

        conv = ConversationFactory()
        result = send_message(conv, "What should I do first?")

        assert result.role == "assistant"
        assert result.content == "Great question! Here is my advice."
        assert Message.objects.filter(conversation=conv, role="user").exists()
        assert Message.objects.filter(conversation=conv, role="assistant").exists()

    @patch("apps.ai.services.AIProviderFactory.get_provider")
    def test_raises_ai_generation_error_on_failure(self, mock_factory):
        mock_provider = MagicMock()
        mock_provider.chat.side_effect = RuntimeError("AI unavailable")
        mock_factory.return_value = mock_provider

        conv = ConversationFactory()
        with pytest.raises(AIGenerationError):
            send_message(conv, "Help me!")
