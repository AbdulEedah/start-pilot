"""Serializers for the chat app."""
from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for a single Conversation Message."""

    class Meta:
        model = Message
        fields = ["id", "role", "content", "created_at"]
        read_only_fields = fields


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for a Conversation (without messages for list views)."""

    class Meta:
        model = Conversation
        fields = ["id", "profile", "created_at", "updated_at"]
        read_only_fields = fields


class SendMessageSerializer(serializers.Serializer):
    """
    Serializer for POST /api/v1/chat/messages/.
    Accepts the user's message text.
    """

    message = serializers.CharField(
        max_length=4000,
        help_text="The message to send to the AI Copilot.",
    )

    def validate_message(self, value: str) -> str:
        """Strip whitespace and ensure the message is not empty."""
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError("Message cannot be empty.")
        return stripped


class ConversationWithMessagesSerializer(serializers.ModelSerializer):
    """Serializer for a Conversation including its full message history."""

    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ["id", "profile", "created_at", "updated_at", "messages"]
        read_only_fields = fields
