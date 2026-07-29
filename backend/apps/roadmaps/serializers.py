"""
Serializers for the roadmaps app.
"""
from rest_framework import serializers

from .models import Roadmap, RoadmapCategory, RoadmapTask


class RoadmapTaskSerializer(serializers.ModelSerializer):
    """
    Serializer for RoadmapTask.

    AI-generated fields (title, description, priority, start_week, end_week)
    are read-only; users may update is_completed and user_notes.
    """

    priority_display = serializers.CharField(source="get_priority_display", read_only=True)

    class Meta:
        model = RoadmapTask
        fields = [
            "id",
            "title",
            "description",
            "priority",
            "priority_display",
            "start_week",
            "end_week",
            "is_completed",
            "order",
            "user_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "title",
            "description",
            "priority",
            "priority_display",
            "start_week",
            "end_week",
            "order",
            "created_at",
            "updated_at",
        ]


class RoadmapTaskUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for PATCH /api/v1/roadmap/tasks/{id}/.
    Only allows updating is_completed and user_notes.
    """

    class Meta:
        model = RoadmapTask
        fields = ["is_completed", "user_notes"]


class RoadmapCategorySerializer(serializers.ModelSerializer):
    """Serializer for RoadmapCategory, nested with its tasks."""

    tasks = RoadmapTaskSerializer(many=True, read_only=True)

    class Meta:
        model = RoadmapCategory
        fields = ["id", "name", "order", "tasks"]
        read_only_fields = fields


class RoadmapSerializer(serializers.ModelSerializer):
    """
    Full roadmap serializer with nested categories and tasks.
    Used for GET /api/v1/roadmap/.
    """

    categories = RoadmapCategorySerializer(many=True, read_only=True)
    profile_id = serializers.IntegerField(source="profile.id", read_only=True)

    class Meta:
        model = Roadmap
        fields = [
            "id",
            "profile_id",
            "total_weeks",
            "generated_at",
            "categories",
        ]
        read_only_fields = fields
