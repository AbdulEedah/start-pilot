"""
Chat models for StartPilot.

Models:
    Conversation – Groups messages for a user + startup profile context.
    Message      – A single turn in the conversation (user or assistant).
"""
from django.db import models

from apps.core.models import BaseModel


ROLE_CHOICES = [
    ("user", "User"),
    ("assistant", "Assistant"),
]


class Conversation(BaseModel):
    """
    A conversation session between a user and the AI Copilot.

    Scoped to a StartupProfile so the copilot always has the correct context.
    For MVP, one active conversation per user per profile.
    """

    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="conversations",
        db_index=True,
        verbose_name="user",
    )
    profile = models.ForeignKey(
        "profiles.StartupProfile",
        on_delete=models.CASCADE,
        related_name="conversations",
        verbose_name="startup profile",
    )

    class Meta:
        db_table = "conversations"
        verbose_name = "conversation"
        verbose_name_plural = "conversations"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["profile"]),
        ]

    def __str__(self) -> str:
        return f"Conversation(user={self.user_id}, profile={self.profile_id})"


class Message(BaseModel):
    """
    A single message in a Conversation.
    role 'user' is the founder; role 'assistant' is the AI Copilot.
    """

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
        db_index=True,
        verbose_name="conversation",
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        verbose_name="role",
    )
    content = models.TextField(verbose_name="content")

    class Meta:
        db_table = "messages"
        verbose_name = "message"
        verbose_name_plural = "messages"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["conversation", "created_at"]),
        ]

    def __str__(self) -> str:
        preview = self.content[:60]
        return f"Message(role={self.role}, preview={preview!r})"
