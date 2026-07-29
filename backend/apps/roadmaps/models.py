"""
Roadmap models for StartPilot.

Models:
    Roadmap         – Top-level container, one-to-one with StartupProfile.
    RoadmapCategory – One of five fixed categories (Product, Legal, etc.).
    RoadmapTask     – Individual actionable task within a category.
"""
from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import BaseModel


CATEGORY_CHOICES = [
    ("Product", "Product"),
    ("Legal", "Legal"),
    ("Marketing", "Marketing"),
    ("Finance", "Finance"),
    ("Operations", "Operations"),
]

PRIORITY_CHOICES = [
    ("high", "High"),
    ("medium", "Medium"),
    ("low", "Low"),
]


class Roadmap(BaseModel):
    """
    Top-level roadmap container for a startup profile.
    One-to-one with StartupProfile; replaced on re-generation.
    """

    profile = models.OneToOneField(
        "profiles.StartupProfile",
        on_delete=models.CASCADE,
        related_name="roadmap",
        verbose_name="startup profile",
    )
    total_weeks = models.PositiveSmallIntegerField(
        default=12,
        verbose_name="total weeks",
        help_text="Dynamic total length of the roadmap in weeks.",
    )
    generated_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="generated at",
    )

    class Meta:
        db_table = "roadmaps"
        verbose_name = "roadmap"
        verbose_name_plural = "roadmaps"
        indexes = [models.Index(fields=["profile"])]

    def __str__(self) -> str:
        return f"Roadmap(profile={self.profile_id}, weeks={self.total_weeks})"


class RoadmapCategory(BaseModel):
    """
    One of the five fixed roadmap categories within a Roadmap.
    Ordered for consistent display in the frontend.
    """

    roadmap = models.ForeignKey(
        Roadmap,
        on_delete=models.CASCADE,
        related_name="categories",
        verbose_name="roadmap",
    )
    name = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        verbose_name="category name",
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="display order",
    )

    class Meta:
        db_table = "roadmap_categories"
        verbose_name = "roadmap category"
        verbose_name_plural = "roadmap categories"
        ordering = ["order"]
        unique_together = [("roadmap", "name")]

    def __str__(self) -> str:
        return f"RoadmapCategory(roadmap={self.roadmap_id}, name={self.name})"


class RoadmapTask(BaseModel):
    """
    Individual task within a RoadmapCategory.
    Tasks have week ranges, priorities, and completion tracking.
    Users may add personal notes but cannot change AI-generated core fields.
    """

    category = models.ForeignKey(
        RoadmapCategory,
        on_delete=models.CASCADE,
        related_name="tasks",
        verbose_name="category",
    )
    title = models.CharField(max_length=255, verbose_name="title")
    description = models.TextField(verbose_name="description")
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        db_index=True,
        verbose_name="priority",
    )
    start_week = models.PositiveSmallIntegerField(verbose_name="start week")
    end_week = models.PositiveSmallIntegerField(verbose_name="end week")
    is_completed = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="completed",
    )
    order = models.PositiveSmallIntegerField(default=0, verbose_name="display order")
    user_notes = models.TextField(
        blank=True,
        verbose_name="user notes",
        help_text="Personal notes added by the founder.",
    )

    class Meta:
        db_table = "roadmap_tasks"
        verbose_name = "roadmap task"
        verbose_name_plural = "roadmap tasks"
        ordering = ["order", "start_week"]
        indexes = [
            models.Index(fields=["category", "start_week"]),
            models.Index(fields=["priority"]),
            models.Index(fields=["is_completed"]),
        ]

    def __str__(self) -> str:
        return f"RoadmapTask({self.title!r}, week {self.start_week}-{self.end_week})"

    def clean(self):
        """Enforce that start_week is not after end_week."""
        if self.start_week and self.end_week and self.start_week > self.end_week:
            raise ValidationError(
                {"start_week": "start_week must be less than or equal to end_week."}
            )

    def save(self, *args, **kwargs):
        """Run full clean before saving to enforce week constraints."""
        self.full_clean()
        super().save(*args, **kwargs)
