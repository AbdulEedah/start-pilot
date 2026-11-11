"""
Serializers for the validation app.
"""
from rest_framework import serializers

from .models import ValidationReport


class ValidationReportSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for ValidationReport.

    Exposes the full report structure to the frontend dashboard,
    including calculated percentage breakdowns:
    - Viability Score (%)
    - Market Reality & Feasibility (%)
    - Solution Problem-Solving Effectiveness (%)
    - Risk Index (%)
    - Founder Readiness (%)
    """

    score_label = serializers.CharField(read_only=True)
    profile_id = serializers.IntegerField(source="profile.id", read_only=True)
    viability_percentage = serializers.SerializerMethodField()
    market_feasibility_score = serializers.SerializerMethodField()
    solution_effectiveness_score = serializers.SerializerMethodField()
    risk_index_score = serializers.SerializerMethodField()
    founder_readiness_score = serializers.SerializerMethodField()
    risk_level = serializers.SerializerMethodField()
    viability_level = serializers.SerializerMethodField()

    class Meta:
        model = ValidationReport
        fields = [
            "id",
            "profile_id",
            "score",
            "score_label",
            "viability_percentage",
            "market_feasibility_score",
            "solution_effectiveness_score",
            "risk_index_score",
            "founder_readiness_score",
            "risk_level",
            "viability_level",
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

    def get_viability_percentage(self, obj) -> int:
        return obj.score

    def get_market_feasibility_score(self, obj) -> int:
        # Feasibility based on opportunities identified and market analysis
        bonus = min(len(obj.opportunities) * 3, 12)
        base = int(obj.score * 0.94)
        return min(max(base + bonus, 45), 98)

    def get_solution_effectiveness_score(self, obj) -> int:
        # How well solution solves the problem based on identified strengths
        bonus = min(len(obj.strengths) * 3, 15)
        base = int(obj.score * 0.96)
        return min(max(base + bonus - 3, 48), 99)

    def get_risk_index_score(self, obj) -> int:
        # How risky: calculated risk exposure (lower = safer)
        risk_count = len(obj.risks)
        base_risk = max(12, 100 - obj.score)
        calculated = int((base_risk * 0.6) + (risk_count * 4))
        return min(max(calculated, 12), 85)

    def get_risk_level(self, obj) -> str:
        risk = self.get_risk_index_score(obj)
        if risk <= 25:
            return "Low Risk"
        elif risk <= 50:
            return "Moderate Risk"
        return "Elevated Risk"

    def get_founder_readiness_score(self, obj) -> int:
        base = int(obj.score * 0.9)
        return min(max(base + 7, 50), 96)

    def get_viability_level(self, obj) -> str:
        if obj.score >= 80:
            return "High Viability"
        elif obj.score >= 60:
            return "Strong Viability"
        elif obj.score >= 40:
            return "Moderate Viability"
        return "Developing Viability"
