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
    Accepts the user's message text as either 'message' or 'content'.
    """

    message = serializers.CharField(
        max_length=4000,
        required=False,
        help_text="The message to send to the AI Copilot.",
    )
    content = serializers.CharField(
        max_length=4000,
        required=False,
        help_text="Alias for message.",
    )
    conversation_id = serializers.IntegerField(
        required=False,
        allow_null=True,
    )
    context = serializers.DictField(
        required=False,
        allow_null=True,
    )

    def validate(self, attrs):
        """Allow either 'message' or 'content'."""
        msg = attrs.get("message") or attrs.get("content")
        if not msg or not msg.strip():
            raise serializers.ValidationError({"message": "Message cannot be empty."})
        attrs["message"] = msg.strip()
        return attrs


class ConversationWithMessagesSerializer(serializers.ModelSerializer):
    """Serializer for a Conversation including its full message history."""

    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ["id", "profile", "created_at", "updated_at", "messages"]
        read_only_fields = fields
