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

    def test_token_control_update_limit_and_bonus(self, api_client, admin_user, regular_user):
        api_client.force_authenticate(user=admin_user)
        # 1. Update limit
        res = api_client.post(f"/api/v1/admin/users/{regular_user.id}/tokens/", {"token_limit": 200000}, format="json")
        assert res.status_code == status.HTTP_200_OK
        assert res.data["token_limit"] == 200000

        # 2. Add bonus tokens
        res2 = api_client.post(f"/api/v1/admin/users/{regular_user.id}/tokens/", {"add_tokens": 50000}, format="json")
        assert res2.status_code == status.HTTP_200_OK
        assert res2.data["token_limit"] == 250000

    def test_token_control_reset_used_and_freeze(self, api_client, admin_user, regular_user):
        regular_user.tokens_used = 15000
        regular_user.save()

        api_client.force_authenticate(user=admin_user)
        # Reset used and freeze AI
        res = api_client.post(
            f"/api/v1/admin/users/{regular_user.id}/tokens/",
            {"reset_used": True, "ai_access_blocked": True},
            format="json"
        )
        assert res.status_code == status.HTTP_200_OK
        assert res.data["tokens_used"] == 0
        assert res.data["ai_access_blocked"] is True

        regular_user.refresh_from_db()
        assert regular_user.tokens_used == 0
        assert regular_user.ai_access_blocked is True


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


@pytest.mark.django_db
class TestPublicMentorsScoping:
    def test_unauthenticated_forbidden(self, api_client):
        response = api_client.get("/api/v1/mentors/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_founder_strictly_scoped_to_own_sector_and_all(self, api_client, regular_user):
        from apps.admin_panel.models import Mentor
        StartupProfile.objects.create(
            user=regular_user,
            sector="technology",
            background_story="Tech founder",
            problem="DevOps complexity",
        )
        Mentor.objects.create(name="Tech Mentor", sector="technology", is_active=True, rating=5.0)
        Mentor.objects.create(name="Health Mentor", sector="healthcare", is_active=True, rating=5.0)
        Mentor.objects.create(name="Cross Sector Advisor", sector="all", is_active=True, rating=5.0)

        api_client.force_authenticate(user=regular_user)
        res = api_client.get("/api/v1/mentors/")
        assert res.status_code == status.HTTP_200_OK

        names = [m["name"] for m in res.data["mentors"]]
        assert "Tech Mentor" in names
        assert "Cross Sector Advisor" in names
        assert "Health Mentor" not in names

    def test_founder_filter_types(self, api_client, regular_user):
        from apps.admin_panel.models import Mentor
        StartupProfile.objects.create(
            user=regular_user,
            sector="technology",
            background_story="Tech founder",
            problem="DevOps complexity",
        )
        Mentor.objects.create(name="Tech Mentor", sector="technology", is_active=True, rating=5.0)
        Mentor.objects.create(name="Universal Advisor", sector="all", is_active=True, rating=5.0)

        api_client.force_authenticate(user=regular_user)

        # 1. sector_only
        res_sec = api_client.get("/api/v1/mentors/?filter_type=sector_only")
        assert res_sec.status_code == status.HTTP_200_OK
        sec_names = [m["name"] for m in res_sec.data["mentors"]]
        assert "Tech Mentor" in sec_names
        assert "Universal Advisor" not in sec_names

        # 2. cross_sector
        res_cross = api_client.get("/api/v1/mentors/?filter_type=cross_sector")
        assert res_cross.status_code == status.HTTP_200_OK
        cross_names = [m["name"] for m in res_cross.data["mentors"]]
        assert "Universal Advisor" in cross_names
        assert "Tech Mentor" not in cross_names

    def test_founder_cannot_bypass_scope_via_param(self, api_client, regular_user):
        from apps.admin_panel.models import Mentor
        StartupProfile.objects.create(
            user=regular_user,
            sector="technology",
            background_story="Tech founder",
            problem="DevOps complexity",
        )
        Mentor.objects.create(name="Tech Mentor", sector="technology", is_active=True, rating=5.0)
        Mentor.objects.create(name="Agri Mentor", sector="agriculture", is_active=True, rating=5.0)
        Mentor.objects.create(name="Universal Advisor", sector="all", is_active=True, rating=5.0)

        api_client.force_authenticate(user=regular_user)
        # Attempt to request agriculture sector
        res = api_client.get("/api/v1/mentors/?sector=agriculture")
        assert res.status_code == status.HTTP_200_OK
        names = [m["name"] for m in res.data["mentors"]]
        assert "Agri Mentor" not in names
        assert "Tech Mentor" in names
        assert "Universal Advisor" in names

    def test_staff_can_view_any_sector(self, api_client, admin_user):
        from apps.admin_panel.models import Mentor
        Mentor.objects.create(name="Health Mentor", sector="healthcare", is_active=True, rating=5.0)
        Mentor.objects.create(name="Universal Advisor", sector="all", is_active=True, rating=5.0)

        api_client.force_authenticate(user=admin_user)
        res = api_client.get("/api/v1/mentors/?sector=healthcare")
        assert res.status_code == status.HTTP_200_OK
        names = [m["name"] for m in res.data["mentors"]]
        assert "Health Mentor" in names
        assert "Universal Advisor" in names
