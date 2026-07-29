"""Serializers for the notifications app."""
from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for in-app Notification records."""

    type_display = serializers.CharField(source="get_type_display", read_only=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "type_display",
            "category",
            "category_display",
            "subject",
            "message",
            "is_read",
            "sent_at",
        ]
        read_only_fields = [
            "id",
            "type",
            "type_display",
            "category",
            "category_display",
            "subject",
            "message",
            "sent_at",
        ]
