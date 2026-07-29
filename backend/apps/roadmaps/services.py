"""
Business-logic services for the roadmaps app.

Services:
    generate_roadmap       – Call AI provider and persist the roadmap hierarchy.
    get_roadmap_for_profile – Retrieve roadmap or raise if not ready.
    roadmap_to_context_dict – Serialise roadmap for AI copilot context.
"""
import logging

from django.db import transaction

from apps.ai.services import AIProviderFactory
from apps.core.exceptions import AIGenerationError
from apps.validation.services import profile_to_dict, report_to_dict

from .models import Roadmap, RoadmapCategory, RoadmapTask

logger = logging.getLogger(__name__)

# Canonical category ordering for display consistency
CATEGORY_ORDER = {
    "Product": 0,
    "Legal": 1,
    "Marketing": 2,
    "Finance": 3,
    "Operations": 4,
}


@transaction.atomic
def generate_roadmap(profile, report) -> Roadmap:
    """
    Call the AI provider to generate a categorised startup roadmap, then
    persist the full Roadmap → RoadmapCategory → RoadmapTask hierarchy.

    Deletes any existing roadmap for the profile before creating a fresh one.

    Args:
        profile: StartupProfile instance.
        report:  ValidationReport instance (used as AI context).

    Returns:
        Newly created Roadmap instance (with categories and tasks pre-fetched).

    Raises:
        AIGenerationError: If the AI provider returns an error or invalid data.
    """
    provider = AIProviderFactory.get_provider()
    profile_data = profile_to_dict(profile)
    report_data = report_to_dict(report)

    logger.info("Generating roadmap for profile %s", profile.id)

    try:
        categories_data = provider.generate_roadmap(profile_data, report_data)
    except Exception as exc:
        logger.error("AI roadmap generation failed for profile %s: %s", profile.id, exc)
        raise AIGenerationError(detail=f"Roadmap generation failed: {exc}") from exc

    # Replace existing roadmap atomically
    Roadmap.objects.filter(profile=profile).delete()

    # Determine total weeks from the task data
    total_weeks = _calculate_total_weeks(categories_data)

    roadmap = Roadmap.objects.create(profile=profile, total_weeks=total_weeks)
    _create_categories_and_tasks(roadmap, categories_data)

    logger.info(
        "Roadmap created for profile %s: %d categories, %d weeks",
        profile.id,
        len(categories_data),
        total_weeks,
    )
    return roadmap


def get_roadmap_for_profile(profile) -> Roadmap:
    """
    Return the Roadmap for a profile with all categories and tasks pre-fetched.

    Args:
        profile: StartupProfile instance.

    Returns:
        Roadmap instance.

    Raises:
        Roadmap.DoesNotExist: If no roadmap has been generated yet.
    """
    return (
        Roadmap.objects.prefetch_related("categories__tasks")
        .select_related("profile")
        .get(profile=profile)
    )


def roadmap_to_context_dict(roadmap: Roadmap) -> list[dict]:
    """
    Serialise the roadmap into a compact representation for AI copilot context.

    Args:
        roadmap: Roadmap instance (must have categories and tasks prefetched).

    Returns:
        List of category dicts with summarised task info.
    """
    result = []
    for cat in roadmap.categories.prefetch_related("tasks").all():
        result.append(
            {
                "category": cat.name,
                "tasks": [
                    {
                        "title": t.title,
                        "priority": t.priority,
                        "weeks": f"{t.start_week}-{t.end_week}",
                        "completed": t.is_completed,
                    }
                    for t in cat.tasks.all()
                ],
            }
        )
    return result


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────


def _calculate_total_weeks(categories_data: list[dict]) -> int:
    """
    Determine the roadmap's total duration from the max end_week across all tasks.

    Args:
        categories_data: List of category dicts from the AI response.

    Returns:
        Maximum end_week found, or 12 as the default.
    """
    max_week = 0
    for cat in categories_data:
        for task in cat.get("tasks", []):
            end_week = task.get("end_week", 0)
            if isinstance(end_week, int) and end_week > max_week:
                max_week = end_week
    return max_week or 12


def _create_categories_and_tasks(roadmap: Roadmap, categories_data: list[dict]) -> None:
    """
    Bulk-create RoadmapCategory and RoadmapTask records from AI output.

    Args:
        roadmap:         The parent Roadmap instance.
        categories_data: List of category dicts from the AI response.
    """
    tasks_to_create = []

    for cat_data in categories_data:
        cat_name = cat_data.get("name", "").strip()

        # Normalise name to match CATEGORY_CHOICES (case-insensitive)
        normalised_name = next(
            (n for n in CATEGORY_ORDER if n.lower() == cat_name.lower()),
            cat_name,
        )

        category = RoadmapCategory.objects.create(
            roadmap=roadmap,
            name=normalised_name,
            order=CATEGORY_ORDER.get(normalised_name, 99),
        )

        for idx, task_data in enumerate(cat_data.get("tasks", [])):
            start_week = int(task_data.get("start_week", 1))
            end_week = int(task_data.get("end_week", start_week))
            # Enforce constraint without calling full_clean during bulk prep
            if end_week < start_week:
                end_week = start_week

            tasks_to_create.append(
                RoadmapTask(
                    category=category,
                    title=str(task_data.get("title", ""))[:255],
                    description=str(task_data.get("description", "")),
                    priority=_normalise_priority(task_data.get("priority", "medium")),
                    start_week=start_week,
                    end_week=end_week,
                    order=idx,
                )
            )

    # Bulk insert all tasks in a single query
    RoadmapTask.objects.bulk_create(tasks_to_create)


def _normalise_priority(value: str) -> str:
    """Normalise priority string to one of 'high', 'medium', 'low'."""
    normalised = str(value).lower().strip()
    if normalised in {"high", "medium", "low"}:
        return normalised
    return "medium"
