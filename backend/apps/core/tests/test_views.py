"""Tests for core views."""
import pytest
from unittest.mock import patch
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


@pytest.mark.django_db
class TestHealthCheckView:
    """Tests for GET /api/v1/health/."""

    @patch("apps.core.views.HealthCheckView._check_cache", return_value="ok")
    @patch("apps.core.views.HealthCheckView._check_database", return_value="ok")
    def test_returns_ok_when_healthy(self, mock_db, mock_cache):
        response = APIClient().get(reverse("core:health-check"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "ok"
        assert response.data["database"] == "ok"
        assert response.data["cache"] == "ok"

    @patch("apps.core.views.HealthCheckView._check_cache", return_value="error")
    @patch("apps.core.views.HealthCheckView._check_database", return_value="ok")
    def test_returns_degraded_when_cache_down(self, mock_db, mock_cache):
        response = APIClient().get(reverse("core:health-check"))
        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        assert response.data["status"] == "degraded"

    @patch("apps.core.views.HealthCheckView._check_cache", return_value="ok")
    @patch("apps.core.views.HealthCheckView._check_database", return_value="error")
    def test_returns_degraded_when_db_down(self, mock_db, mock_cache):
        response = APIClient().get(reverse("core:health-check"))
        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE

    def test_does_not_require_authentication(self):
        """Health check must be publicly accessible."""
        client = APIClient()
        with patch("apps.core.views.HealthCheckView._check_database", return_value="ok"):
            with patch("apps.core.views.HealthCheckView._check_cache", return_value="ok"):
                response = client.get(reverse("core:health-check"))
        assert response.status_code == status.HTTP_200_OK
