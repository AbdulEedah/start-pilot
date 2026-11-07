"""
Tests for Admin Panel endpoints.
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from apps.admin_panel.models import PlatformResource, SystemSetting
from apps.profiles.models import StartupProfile

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        email="test_admin@startpilot.io",
        password="TestPassword123!",
        full_name="Platform Admin",
    )


@pytest.fixture
def regular_user(db):
    return User.objects.create_user(
        email="founder@example.com",
        password="FounderPassword123!",
        full_name="Founder User",
    )


@pytest.mark.django_db
class TestAdminAnalytics:
    def test_anonymous_forbidden(self, api_client):
        response = api_client.get("/api/v1/admin/analytics/")
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]

    def test_non_staff_forbidden(self, api_client, regular_user):
        api_client.force_authenticate(user=regular_user)
        response = api_client.get("/api/v1/admin/analytics/")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_staff_allowed(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        response = api_client.get("/api/v1/admin/analytics/")
        assert response.status_code == status.HTTP_200_OK
        assert "metrics" in response.data
        assert "sectors" in response.data
        assert "trend" in response.data


@pytest.mark.django_db
class TestAdminVentures:
    def test_list_ventures(self, api_client, admin_user, regular_user):
        StartupProfile.objects.create(
            user=regular_user,
            sector="technology",
            problem="Developers struggle with microservice orchestration.",
            background_story="DevOps engineer for 5 years.",
            generation_status="completed",
        )
        api_client.force_authenticate(user=admin_user)
        response = api_client.get("/api/v1/admin/ventures/")
        assert response.status_code == status.HTTP_200_OK
        assert "ventures" in response.data
        assert len(response.data["ventures"]) >= 1
        assert response.data["ventures"][0]["founder_email"] == "founder@example.com"


@pytest.mark.django_db
class TestAdminUsers:
    def test_list_users(self, api_client, admin_user, regular_user):
        api_client.force_authenticate(user=admin_user)
        response = api_client.get("/api/v1/admin/users/")
        assert response.status_code == status.HTTP_200_OK
        assert "users" in response.data
        assert len(response.data["users"]) >= 2

    def test_create_user(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        payload = {
            "email": "newbie@startpilot.io",
            "full_name": "Newbie Founder",
            "password": "SecurePassword123!",
            "is_staff": False,
        }
        response = api_client.post("/api/v1/admin/users/", payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email="newbie@startpilot.io").exists()

    def test_toggle_user_active(self, api_client, admin_user, regular_user):
        api_client.force_authenticate(user=admin_user)
        response = api_client.patch(f"/api/v1/admin/users/{regular_user.id}/", {"is_active": False}, format="json")
        assert response.status_code == status.HTTP_200_OK
        regular_user.refresh_from_db()
        assert regular_user.is_active is False


@pytest.mark.django_db
class TestAdminContentAndSettings:
    def test_get_content(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        response = api_client.get("/api/v1/admin/content/")
        assert response.status_code == status.HTTP_200_OK
        assert "sectors" in response.data
        assert "resources" in response.data

    def test_add_resource(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        payload = {
            "name": "Supabase Start",
            "category": "Backend",
            "type": "Tool",
            "url": "https://supabase.com",
            "sector": "technology",
        }
        response = api_client.post("/api/v1/admin/content/", payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert PlatformResource.objects.filter(name="Supabase Start").exists()

    def test_get_and_save_settings(self, api_client, admin_user):
        api_client.force_authenticate(user=admin_user)
        get_res = api_client.get("/api/v1/admin/settings/")
        assert get_res.status_code == status.HTTP_200_OK

        save_res = api_client.post("/api/v1/admin/settings/", {"platform_name": "Start Pilot Pro"}, format="json")
        assert save_res.status_code == status.HTTP_200_OK
        assert SystemSetting.get_setting("platform_config")["platform_name"] == "Start Pilot Pro"
