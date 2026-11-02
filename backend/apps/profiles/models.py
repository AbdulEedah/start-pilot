"""
Profiles models for StartPilot.

Model:
    StartupProfile – one-to-one with User; stores all onboarding data
                     and tracks AI generation status.
"""
from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import BaseModel


# ─────────────────────────────────────────────────────────────────────────────
# Choices
# ─────────────────────────────────────────────────────────────────────────────

SECTOR_CHOICES = [
    ("technology", "Technology"),
    ("climate", "Climate"),
    ("agriculture", "Agriculture"),
    ("manufacturing", "Manufacturing"),
    ("production", "Production"),
    ("health", "Health"),
    ("education", "Education"),
    ("finance", "Finance"),
    ("ai", "AI"),
    ("logistics", "Logistics"),
    ("fashion", "Fashion"),
    ("social", "Social"),
]

TEAM_STATUS_CHOICES = [
    ("solo", "Solo"),
    ("cofounder", "Cofounder(s)"),
    ("small_team", "Small Team 3-5"),
    ("medium_team", "Medium Team 6-10"),
    ("large_team", "Large Team 10+"),
]

TIME_COMMITMENT_CHOICES = [
    ("full", "Full-time 40+ hrs/week"),
    ("part", "Part-time 20-40 hrs"),
    ("weekend", "Weekends only"),
    ("evening", "Evenings after work"),
]

GENERATION_STATUS_CHOICES = [
    ("idle", "Idle"),
    ("pending", "Pending"),
    ("processing", "Processing"),
    ("completed", "Completed"),
    ("failed", "Failed"),
]

# Default structure for available_resources JSON field
DEFAULT_AVAILABLE_RESOURCES = {
    "financial": {"capital": 0, "savings": 0},
    "human": {"team_size": 1, "cofounders": 0},
    "assets": {"office_space": False, "equipment": False},
    "time": {"hours_per_week": 0},
}


class StartupProfile(BaseModel):
    """
    Stores all onboarding data for a founder's startup.

    One-to-one with User for MVP; designed for future multi-profile support
    by relaxing the one-to-one constraint.

    The ``generation_status`` field is updated by the Celery task that
    orchestrates AI report and roadmap generation.
    """

    user = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="startup_profile",
        verbose_name="user",
    )

    # ── Startup identity ─────────────────────────────────────────────────────
    sector = models.CharField(
        max_length=50,
        choices=SECTOR_CHOICES,
        db_index=True,
        verbose_name="sector",
        help_text="Industry sector the startup operates in.",
    )
    background_story = models.TextField(
        verbose_name="background story",
        help_text="Founder's background and what led them to this idea.",
    )
    problem = models.TextField(
        verbose_name="problem",
        help_text="The core problem the startup is solving.",
    )

    # ── Location ─────────────────────────────────────────────────────────────
    country = models.CharField(max_length=100, db_index=True, verbose_name="country")
    state = models.CharField(max_length=100, blank=True, verbose_name="state / province")
    city = models.CharField(max_length=100, verbose_name="city")

    # ── Founder background ───────────────────────────────────────────────────
    existing_experience = models.TextField(
        blank=True,
        verbose_name="existing experience",
        help_text="Relevant professional or domain experience.",
    )
    key_skills = models.JSONField(
        default=list,
        verbose_name="key skills",
        help_text="Array of skill tag strings, e.g. ['Python', 'Marketing'].",
    )

    # ── Resources ────────────────────────────────────────────────────────────
    available_resources = models.JSONField(
        default=dict,
        verbose_name="available resources",
        help_text=(
            "Structured resource data: financial capital/savings, "
            "human team_size/cofounders, assets, and weekly time commitment."
        ),
    )

    # ── Team & time ──────────────────────────────────────────────────────────
    team_status = models.CharField(
        max_length=20,
        choices=TEAM_STATUS_CHOICES,
        verbose_name="team status",
        help_text="Current team composition.",
    )
    time_commitment = models.CharField(
        max_length=20,
        choices=TIME_COMMITMENT_CHOICES,
        verbose_name="time commitment",
        help_text="How much time the founder can dedicate per week.",
    )

    # ── Onboarding & generation state ────────────────────────────────────────
    onboarding_completed = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="onboarding completed",
        help_text="Set to True when the founder submits the complete onboarding form.",
    )
    generation_status = models.CharField(
        max_length=20,
        choices=GENERATION_STATUS_CHOICES,
        default="idle",
        db_index=True,
        verbose_name="generation status",
        help_text="Tracks the progress of AI report and roadmap generation.",
    )
    generation_error = models.TextField(
        blank=True,
        verbose_name="generation error",
        help_text="Error message stored when generation fails.",
    )

    class Meta:
        db_table = "startup_profiles"
        verbose_name = "startup profile"
        verbose_name_plural = "startup profiles"
        indexes = [
            models.Index(fields=["sector"]),
            models.Index(fields=["country"]),
            models.Index(fields=["team_status"]),
            models.Index(fields=["onboarding_completed"]),
            models.Index(fields=["generation_status"]),
        ]

    def __str__(self) -> str:
        return f"StartupProfile(user={self.user.email}, sector={self.sector})"

    def clean(self):
        """Validate that available_resources has the expected top-level keys."""
        if self.available_resources:
            required_keys = {"financial", "human", "assets", "time"}
            provided_keys = set(self.available_resources.keys())
            missing = required_keys - provided_keys
            if missing:
                raise ValidationError(
                    {
                        "available_resources": (
                            f"Missing required resource keys: {', '.join(sorted(missing))}."
                        )
                    }
                )

    def save(self, *args, **kwargs):
        """Ensure available_resources has a default structure if not provided."""
        if not self.available_resources:
            self.available_resources = DEFAULT_AVAILABLE_RESOURCES.copy()
        super().save(*args, **kwargs)

    @property
    def is_generation_complete(self) -> bool:
        """Return True when AI generation has finished successfully."""
        return self.generation_status == "completed"

    @property
    def is_generation_failed(self) -> bool:
        """Return True when AI generation has failed after all retries."""
        return self.generation_status == "failed"
