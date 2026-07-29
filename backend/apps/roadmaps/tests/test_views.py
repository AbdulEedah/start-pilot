"""Tests for roadmaps API views."""
import pytest
from unittest.mock import MagicMock, patch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.tests.factories import UserFactory
from apps.profiles.tests.factories import CompletedProfileFactory
from apps.roadmaps.tests.factories import RoadmapCategoryFactory, RoadmapFactory, RoadmapTaskFactory


def make_auth_client(user):
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")
    return client


@pytest.mark.django_db
class TestRoadmapView:
    """Tests for GET /api/v1/roadmap/."""

    def test_returns_roadmap_with_categories(self):
        user = UserFactory()
        profile = CompletedProfileFactory(user=user)
        roadmap = RoadmapFactory(profile=profile)
        cat = RoadmapCategoryFactory(roadmap=roadmap, name="Product")
        RoadmapTaskFactory(category=cat, title="Build MVP")

        client = make_auth_client(user)
        response = client.get(reverse("roadmaps:roadmap"))
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["categories"]) == 1
        assert response.data["categories"][0]["name"] == "Product"

    def test_returns_404_when_no_roadmap(self):
        user = UserFactory()
        CompletedProfileFactory(user=user)
        client = make_auth_client(user)
        response = client.get(reverse("roadmaps:roadmap"))
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_requires_authentication(self):
        response = APIClient().get(reverse("roadmaps:roadmap"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestRoadmapTaskUpdateView:
    """Tests for PATCH /api/v1/roadmap/tasks/{id}/."""

    def test_owner_can_mark_task_complete(self):
        user = UserFactory()
        profile = CompletedProfileFactory(user=user)
        roadmap = RoadmapFactory(profile=profile)
        cat = RoadmapCategoryFactory(roadmap=roadmap)
        task = RoadmapTaskFactory(category=cat, is_completed=False)

        client = make_auth_client(user)
        response = client.patch(
            reverse("roadmaps:task-update", kwargs={"task_id": task.pk}),
            {"is_completed": True},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        task.refresh_from_db()
        assert task.is_completed is True

    def test_owner_can_add_notes(self):
        user = UserFactory()
        profile = CompletedProfileFactory(user=user)
        roadmap = RoadmapFactory(profile=profile)
        cat = RoadmapCategoryFactory(roadmap=roadmap)
        task = RoadmapTaskFactory(category=cat)

        client = make_auth_client(user)
        response = client.patch(
            reverse("roadmaps:task-update", kwargs={"task_id": task.pk}),
            {"user_notes": "Remember to validate with customers first."},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        task.refresh_from_db()
        assert task.user_notes == "Remember to validate with customers first."

    def test_other_user_cannot_update_task(self):
        user_a = UserFactory()
        user_b = UserFactory()
        profile = CompletedProfileFactory(user=user_a)
        roadmap = RoadmapFactory(profile=profile)
        cat = RoadmapCategoryFactory(roadmap=roadmap)
        task = RoadmapTaskFactory(category=cat)

        client_b = make_auth_client(user_b)
        response = client_b.patch(
            reverse("roadmaps:task-update", kwargs={"task_id": task.pk}),
            {"is_completed": True},
            format="json",
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
