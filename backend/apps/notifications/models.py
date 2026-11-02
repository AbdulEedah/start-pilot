"""
Notifications models for StartPilot.

Model:
    Notification – Stores both in-app and email notification records.
"""
from django.db import models

from apps.core.models import BaseModel


NOTIFICATION_TYPE_CHOICES = [
    ("email", "Email"),
    ("in_app", "In-App"),
]

NOTIFICATION_CATEGORY_CHOICES = [
    ("welcome", "Welcome"),
    ("verification", "Email Verification"),
    ("password_reset", "Password Reset"),
    ("report_ready", "Report Ready"),
    ("roadmap_ready", "Roadmap Ready"),
]


class Notification(BaseModel):
    """
    Represents a notification sent to a user.

    Covers both in-app notifications (displayed in the UI bell icon)
    and email notifications (sent via SMTP).  A single event may
    produce two Notification records – one of each type.
    """

    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="notifications",
        db_index=True,
        verbose_name="user",
    )
    type = models.CharField(
        max_length=10,
        choices=NOTIFICATION_TYPE_CHOICES,
        db_index=True,
        verbose_name="notification type",
    )
    category = models.CharField(
        max_length=20,
        choices=NOTIFICATION_CATEGORY_CHOICES,
        db_index=True,
        verbose_name="category",
    )
    subject = models.CharField(
        max_length=255,
        verbose_name="subject",
        help_text="Email subject line (also used as the in-app notification title).",
    )
    message = models.TextField(
        verbose_name="message",
        help_text="Full notification body text.",
    )
    is_read = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="read",
        help_text="For in-app notifications: whether the user has seen this.",
    )
    sent_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="sent at",
    )

    class Meta:
        db_table = "notifications"
        verbose_name = "notification"
        verbose_name_plural = "notifications"
        ordering = ["-sent_at"]
        indexes = [
            models.Index(fields=["user", "is_read", "-sent_at"]),
            models.Index(fields=["user", "type"]),
        ]

    def __str__(self) -> str:
        return f"Notification(user={self.user_id}, category={self.category}, type={self.type})"
