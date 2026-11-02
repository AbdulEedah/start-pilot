"""
Serializers for the profiles app.
"""
from rest_framework import serializers

from .models import (
    GENERATION_STATUS_CHOICES,
    SECTOR_CHOICES,
    TEAM_STATUS_CHOICES,
    TIME_COMMITMENT_CHOICES,
    StartupProfile,
)


class StartupProfileSerializer(serializers.ModelSerializer):
    """
    Full read/write serializer for StartupProfile.

    Used for GET (retrieve) and PUT/PATCH (update) of the user's
    startup profile during and after onboarding.
    """

    # Expose choice labels alongside values for frontend convenience
    sector_display = serializers.CharField(source="get_sector_display", read_only=True)
    team_status_display = serializers.CharField(source="get_team_status_display", read_only=True)
    time_commitment_display = serializers.CharField(
        source="get_time_commitment_display", read_only=True
    )
    generation_status_display = serializers.CharField(
        source="get_generation_status_display", read_only=True
    )

    class Meta:
        model = StartupProfile
        fields = [
            "id",
            "sector",
            "sector_display",
            "background_story",
            "problem",
            "country",
            "state",
            "city",
            "existing_experience",
            "key_skills",
            "available_resources",
            "team_status",
            "team_status_display",
            "time_commitment",
            "time_commitment_display",
            "onboarding_completed",
            "generation_status",
            "generation_status_display",
            "generation_error",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "onboarding_completed",
            "generation_status",
            "generation_status_display",
            "generation_error",
            "created_at",
            "updated_at",
            "sector_display",
            "team_status_display",
            "time_commitment_display",
        ]

    def validate_key_skills(self, value) -> list:
        """Ensure key_skills is a flat list of non-empty strings."""
        if not isinstance(value, list):
            raise serializers.ValidationError("key_skills must be a list of strings.")
        cleaned = []
        for item in value:
            if not isinstance(item, str) or not item.strip():
                raise serializers.ValidationError(
                    "Each skill must be a non-empty string."
                )
            cleaned.append(item.strip())
        return cleaned

    def validate_available_resources(self, value) -> dict:
        """Ensure available_resources contains the required top-level keys."""
        if not isinstance(value, dict):
            raise serializers.ValidationError("available_resources must be an object.")
        required_keys = {"financial", "human", "assets", "time"}
        missing = required_keys - set(value.keys())
        if missing:
            raise serializers.ValidationError(
                f"Missing required resource keys: {', '.join(sorted(missing))}."
            )
        return value


class StartupProfileStatusSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer returning only the generation status.
    Used by GET /api/v1/profile/status/ for frontend polling.
    """

    generation_status_display = serializers.CharField(
        source="get_generation_status_display", read_only=True
    )

    class Meta:
        model = StartupProfile
        fields = [
            "id",
            "onboarding_completed",
            "generation_status",
            "generation_status_display",
            "generation_error",
        ]
        read_only_fields = fields


class CompleteOnboardingSerializer(serializers.Serializer):
    """
    Serializer for the complete-onboarding action.
    No additional fields needed – the action uses the existing profile data.
    """

    pass


class SectorChoiceSerializer(serializers.Serializer):
    """Exposes available sector choices for the frontend."""

    value = serializers.CharField()
    label = serializers.CharField()
