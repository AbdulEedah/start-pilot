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
    Allows updating is_completed, status string, and user_notes.
    """

    status = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = RoadmapTask
        fields = ["is_completed", "status", "user_notes"]

    def validate(self, attrs):
        if "status" in attrs:
            attrs["is_completed"] = attrs.pop("status") == "completed"
        return attrs


class RoadmapCategorySerializer(serializers.ModelSerializer):
    """Serializer for RoadmapCategory, nested with its tasks."""

    tasks = RoadmapTaskSerializer(many=True, read_only=True)

    class Meta:
        model = RoadmapCategory
        fields = ["id", "name", "order", "tasks"]
        read_only_fields = fields


class RoadmapSerializer(serializers.ModelSerializer):
    """
    Full roadmap serializer with nested categories and flat tasks.
    Used for GET /api/v1/roadmap/ and POST /api/v1/roadmap/.
    """

    categories = RoadmapCategorySerializer(many=True, read_only=True)
    profile_id = serializers.IntegerField(source="profile.id", read_only=True)
    startup_name = serializers.CharField(source="profile.startup_name", read_only=True)
    industry = serializers.CharField(source="profile.industry", read_only=True)
    stage = serializers.CharField(source="profile.stage", read_only=True)
    tasks = serializers.SerializerMethodField()

    class Meta:
        model = Roadmap
        fields = [
            "id",
            "profile_id",
            "startup_name",
            "industry",
            "stage",
            "total_weeks",
            "generated_at",
            "created_at",
            "updated_at",
            "categories",
            "tasks",
        ]
        read_only_fields = fields

    def get_tasks(self, obj):
        tasks_list = []
        for cat in obj.categories.all():
            for task in cat.tasks.all():
                tasks_list.append({
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "category": cat.name.lower(),
                    "phase": cat.name,
                    "priority": task.priority,
                    "order": task.order,
                    "status": "completed" if task.is_completed else "pending",
                    "estimated_duration": (
                        f"Week {task.start_week}-{task.end_week}"
                        if task.start_week != task.end_week
                        else f"Week {task.start_week}"
                    ),
                    "start_week": task.start_week,
                    "end_week": task.end_week,
                    "is_completed": task.is_completed,
                    "user_notes": task.user_notes,
                    "created_at": task.created_at.isoformat() if task.created_at else None,
                    "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                })
        return tasks_list
