"""Tests for roadmaps services."""
import pytest
from unittest.mock import MagicMock, patch

from apps.core.exceptions import AIGenerationError
from apps.profiles.tests.factories import CompletedProfileFactory
from apps.roadmaps.models import Roadmap, RoadmapCategory, RoadmapTask
from apps.roadmaps.services import generate_roadmap, get_roadmap_for_profile
from apps.validation.tests.factories import ValidationReportFactory


MOCK_CATEGORIES = [
    {
        "name": "Product",
        "tasks": [
            {
                "title": "Define MVP scope",
                "description": "Outline core features.",
                "priority": "high",
                "start_week": 1,
                "end_week": 2,
            }
        ],
    },
    {
        "name": "Legal",
        "tasks": [
            {
                "title": "Register business",
                "description": "CAC registration.",
                "priority": "medium",
                "start_week": 2,
                "end_week": 4,
            }
        ],
    },
    {
        "name": "Marketing",
        "tasks": [
            {
                "title": "Build landing page",
                "description": "Create a simple landing page.",
                "priority": "medium",
                "start_week": 3,
                "end_week": 5,
            }
        ],
    },
    {
        "name": "Finance",
        "tasks": [
            {
                "title": "Open business account",
                "description": "Bank setup.",
                "priority": "low",
                "start_week": 2,
                "end_week": 3,
            }
        ],
    },
    {
        "name": "Operations",
        "tasks": [
            {
                "title": "Set up project management",
                "description": "Use Trello or Notion.",
                "priority": "low",
                "start_week": 1,
                "end_week": 1,
            }
        ],
    },
]


@pytest.mark.django_db
class TestGenerateRoadmap:
    """Tests for generate_roadmap service."""

    @patch("apps.ai.services.AIProviderFactory.get_provider")
    def test_creates_roadmap_hierarchy(self, mock_factory):
        mock_provider = MagicMock()
        mock_provider.generate_roadmap.return_value = MOCK_CATEGORIES
        mock_factory.return_value = mock_provider

        profile = CompletedProfileFactory()
        report = ValidationReportFactory(profile=profile)
        roadmap = generate_roadmap(profile, report)

        assert roadmap.pk is not None
        assert RoadmapCategory.objects.filter(roadmap=roadmap).count() == 5
        assert RoadmapTask.objects.filter(category__roadmap=roadmap).count() == 5

    @patch("apps.ai.services.AIProviderFactory.get_provider")
    def test_replaces_existing_roadmap(self, mock_factory):
        mock_provider = MagicMock()
        mock_provider.generate_roadmap.return_value = MOCK_CATEGORIES
        mock_factory.return_value = mock_provider

        from apps.roadmaps.tests.factories import RoadmapFactory
        profile = CompletedProfileFactory()
        RoadmapFactory(profile=profile)
        report = ValidationReportFactory(profile=profile)

        generate_roadmap(profile, report)
        assert Roadmap.objects.filter(profile=profile).count() == 1

    @patch("apps.ai.services.AIProviderFactory.get_provider")
    def test_total_weeks_reflects_max_end_week(self, mock_factory):
        mock_provider = MagicMock()
        mock_provider.generate_roadmap.return_value = MOCK_CATEGORIES
        mock_factory.return_value = mock_provider

        profile = CompletedProfileFactory()
        report = ValidationReportFactory(profile=profile)
        roadmap = generate_roadmap(profile, report)
        # Max end_week in MOCK_CATEGORIES is 5
        assert roadmap.total_weeks == 5

    @patch("apps.ai.services.AIProviderFactory.get_provider")
    def test_raises_ai_generation_error_on_failure(self, mock_factory):
        mock_provider = MagicMock()
        mock_provider.generate_roadmap.side_effect = RuntimeError("AI error")
        mock_factory.return_value = mock_provider

        profile = CompletedProfileFactory()
        report = ValidationReportFactory(profile=profile)
        with pytest.raises(AIGenerationError):
            generate_roadmap(profile, report)


@pytest.mark.django_db
class TestGetRoadmapForProfile:
    """Tests for get_roadmap_for_profile."""

    @patch("apps.ai.services.AIProviderFactory.get_provider")
    def test_returns_roadmap(self, mock_factory):
        mock_provider = MagicMock()
        mock_provider.generate_roadmap.return_value = MOCK_CATEGORIES
        mock_factory.return_value = mock_provider

        profile = CompletedProfileFactory()
        report = ValidationReportFactory(profile=profile)
        generate_roadmap(profile, report)
        roadmap = get_roadmap_for_profile(profile)
        assert roadmap.profile == profile

    def test_raises_does_not_exist_when_missing(self):
        profile = CompletedProfileFactory()
        with pytest.raises(Roadmap.DoesNotExist):
            get_roadmap_for_profile(profile)
