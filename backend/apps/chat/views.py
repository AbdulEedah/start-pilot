"""
Views for the chat app.

Endpoints:
    GET  /api/v1/chat/conversations/ – List the user's conversations.
    POST /api/v1/chat/messages/      – Send a message; creates conversation if needed.
    GET  /api/v1/chat/messages/      – List messages for the user's active conversation.
"""
import logging

from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView

from apps.core.exceptions import OnboardingNotCompleteError, ProfileNotFoundError
from apps.profiles.models import StartupProfile

from . import services
from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    ConversationWithMessagesSerializer,
    MessageSerializer,
    SendMessageSerializer,
)

logger = logging.getLogger(__name__)


class AIRateThrottle(UserRateThrottle):
    """Custom throttle for AI-heavy endpoints: 20 requests/hour per user."""

    scope = "ai"


class ConversationListView(APIView):
    """
    GET /api/v1/chat/conversations/

    List the authenticated user's conversations, ordered by most recent.
    For MVP, users typically have one conversation per profile.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: ConversationSerializer(many=True)},
        summary="List user conversations",
    )
    def get(self, request, *args, **kwargs):
        """Return all conversations for the authenticated user."""
        conversations = Conversation.objects.filter(user=request.user).select_related("profile")
        return Response(ConversationSerializer(conversations, many=True).data)


class SendMessageView(APIView):
    """
    POST /api/v1/chat/messages/

    Send a message to the AI Copilot.
    Creates a conversation automatically if one doesn't exist.
    Rate limited to 20 requests/hour per user.
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [AIRateThrottle]

    @extend_schema(
        request=SendMessageSerializer,
        responses={200: MessageSerializer},
        summary="Send a message to the AI Copilot",
    )
    def post(self, request, *args, **kwargs):
        """Process a message through the Copilot and return the AI response."""
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Require an existing startup profile to send messages
        try:
            profile = StartupProfile.objects.get(user=request.user)
        except StartupProfile.DoesNotExist:
            raise ProfileNotFoundError()

        if not profile.onboarding_completed:
            raise OnboardingNotCompleteError()

        conversation, _ = services.get_or_create_conversation(request.user, profile)

        assistant_message = services.send_message(
            conversation=conversation,
            user_message=serializer.validated_data["message"],
        )

        message_data = MessageSerializer(assistant_message).data
        return Response({**message_data, 'message': message_data, 'conversation_id': conversation.id}, status=status.HTTP_200_OK)


class MessageListView(APIView):
    """
    GET /api/v1/chat/messages/

    Return the message history for the user's active conversation.
    Creates an empty conversation if none exists.
    Supports ?page and ?page_size query parameters.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter("page", int, description="Page number (default 1)"),
            OpenApiParameter("page_size", int, description="Results per page (default 20, max 100)"),
        ],
        responses={200: MessageSerializer(many=True)},
        summary="List messages in the active conversation",
    )
    def get(self, request, *args, **kwargs):
        """Return paginated message history for the active conversation."""
        try:
            profile = StartupProfile.objects.get(user=request.user)
        except StartupProfile.DoesNotExist:
            raise ProfileNotFoundError()

        conversation = (
            Conversation.objects.filter(user=request.user, profile=profile)
            .order_by("-created_at")
            .first()
        )

        if not conversation:
            return Response(
                {
                    "count": 0,
                    "total_pages": 0,
                    "next": None,
                    "previous": None,
                    "results": [],
                }
            )

        from apps.core.pagination import StandardResultsSetPagination

        messages = Message.objects.filter(conversation=conversation).order_by("created_at")
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(messages, request)
        return paginator.get_paginated_response(MessageSerializer(page, many=True).data)

