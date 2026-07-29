"""AppConfig for the roadmaps app."""
from django.apps import AppConfig


class RoadmapsConfig(AppConfig):
    """Roadmaps app – Roadmap, RoadmapCategory, RoadmapTask models and services."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.roadmaps"
    label = "roadmaps"
