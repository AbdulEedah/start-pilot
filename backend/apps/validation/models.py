"""
Validation models for StartPilot.

Model:
    ValidationReport – Stores the AI-generated startup validation report,
                       one-to-one with StartupProfile.
"""
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.core.models import BaseModel


class ValidationReport(BaseModel):
    """
    AI-generated validation report for a startup profile.

    All fields are populated by the AI generation pipeline; they are
    not editable by the end user. The report is tightly coupled to the
    profile via a one-to-one relationship so a new generation always
    replaces the previous one atomically.
    """

    profile = models.OneToOneField(
        "profiles.StartupProfile",
        on_delete=models.CASCADE,
        related_name="validation_report",
        verbose_name="startup profile",
    )

    # ── Scoring ──────────────────────────────────────────────────────────────
    score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="viability score",
        help_text="Overall startup viability score from 0 (worst) to 100 (best).",
    )

    # ── Narrative fields ─────────────────────────────────────────────────────
    executive_summary = models.TextField(verbose_name="executive summary")
    market_analysis = models.TextField(verbose_name="market analysis")
    competitor_analysis = models.TextField(verbose_name="competitor analysis")
    founder_readiness = models.TextField(verbose_name="founder readiness")
    sector_considerations = models.TextField(verbose_name="sector considerations")
    action_plan = models.TextField(verbose_name="action plan")

    # ── JSON arrays ───────────────────────────────────────────────────────────
    strengths = models.JSONField(
        default=list,
        verbose_name="strengths",
        help_text="List of startup strengths identified by the AI.",
    )
    weaknesses = models.JSONField(
        default=list,
        verbose_name="weaknesses",
        help_text="List of startup weaknesses identified by the AI.",
    )
    opportunities = models.JSONField(
        default=list,
        verbose_name="opportunities",
        help_text="List of market opportunities identified by the AI.",
    )
    risks = models.JSONField(
        default=list,
        verbose_name="risks",
        help_text="List of critical risks identified by the AI.",
    )
    recommendations = models.JSONField(
        default=list,
        verbose_name="recommendations",
        help_text="List of actionable recommendations from the AI.",
    )

    # ── Metadata ─────────────────────────────────────────────────────────────
    generated_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="generated at",
        help_text="Timestamp of when the AI generated this report.",
    )

    class Meta:
        db_table = "validation_reports"
        verbose_name = "validation report"
        verbose_name_plural = "validation reports"
        indexes = [
            models.Index(fields=["profile"]),
            models.Index(fields=["score"]),
        ]

    def __str__(self) -> str:
        return f"ValidationReport(profile={self.profile_id}, score={self.score})"

    @property
    def score_label(self) -> str:
        """Return a human-readable label for the viability score band."""
        if self.score >= 80:
            return "Strong"
        if self.score >= 60:
            return "Promising"
        if self.score >= 40:
            return "Moderate"
        return "Needs Work"
