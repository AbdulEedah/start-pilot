"""Tests for roadmaps models."""
import pytest
from django.core.exceptions import ValidationError

from apps.roadmaps.tests.factories import RoadmapCategoryFactory, RoadmapFactory, RoadmapTaskFactory


@pytest.mark.django_db
class TestRoadmapTaskModel:
    """Tests for RoadmapTask model constraints."""

    def test_str_representation(self):
        task = RoadmapTaskFactory(title="Launch MVP", start_week=1, end_week=3)
        assert "Launch MVP" in str(task)
        assert "1-3" in str(task)

    def test_valid_week_range_saves(self):
        task = RoadmapTaskFactory(start_week=2, end_week=4)
        assert task.pk is not None

    def test_start_week_after_end_week_raises_validation_error(self):
        with pytest.raises(ValidationError):
            RoadmapTaskFactory(start_week=5, end_week=3)

    def test_equal_start_and_end_week_is_valid(self):
        task = RoadmapTaskFactory(start_week=2, end_week=2)
        assert task.pk is not None

    def test_default_is_completed_is_false(self):
        task = RoadmapTaskFactory()
        assert task.is_completed is False


@pytest.mark.django_db
class TestRoadmapCategory:
    """Tests for RoadmapCategory model."""

    def test_str_representation(self):
        cat = RoadmapCategoryFactory(name="Product")
        assert "Product" in str(cat)

    def test_unique_category_per_roadmap(self):
        from django.db import IntegrityError
        roadmap = RoadmapFactory()
        RoadmapCategoryFactory(roadmap=roadmap, name="Legal")
        with pytest.raises(IntegrityError):
            RoadmapCategoryFactory(roadmap=roadmap, name="Legal")
