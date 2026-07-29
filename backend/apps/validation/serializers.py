"""
Serializers for the validation app.
"""
from rest_framework import serializers

from .models import ValidationReport


class ValidationReportSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for ValidationReport.

    Exposes the full report structure to the frontend dashboard.
    All fields are system-generated and not editable by users.
    """

    score_label = serializers.CharField(read_only=True)
    profile_id = serializers.IntegerField(source="profile.id", read_only=True)

    class Meta:
        model = ValidationReport
        fields = [
            "id",
            "profile_id",
            "score",
            "score_label",
            "executive_summary",
            "strengths",
            "weaknesses",
            "opportunities",
            "risks",
            "recommendations",
            "market_analysis",
            "competitor_analysis",
            "founder_readiness",
            "sector_considerations",
            "action_plan",
            "generated_at",
        ]
        read_only_fields = fields
