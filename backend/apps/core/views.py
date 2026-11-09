"""
Core views – health check endpoint.
"""
import logging

from django.core.cache import cache
from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class HealthCheckView(APIView):
    """
    GET /api/v1/health/

    Returns the health status of the application including database
    and Redis cache connectivity.  No authentication required.
    """

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        """Perform connectivity checks and return status."""
        health = {
            "status": "ok",
            "database": self._check_database(),
            "cache": self._check_cache(),
        }

        overall_ok = all(v == "ok" for v in [health["database"], health["cache"]])
        if not overall_ok:
            health["status"] = "degraded"

        # Return 200 as long as the database is reachable so health check succeeds
        status_code = 200 if health["database"] == "ok" else 503
        return Response(health, status=status_code)

    def _check_database(self) -> str:
        """Return 'ok' if the database is reachable, 'error' otherwise."""
        try:
            connection.ensure_connection()
            return "ok"
        except Exception as exc:
            logger.error("Health check – database unreachable: %s", exc)
            return "error"

    def _check_cache(self) -> str:
        """Return 'ok' if Redis cache is reachable, 'error' otherwise."""
        try:
            cache.set("health_check", "ok", timeout=5)
            result = cache.get("health_check")
            return "ok" if result == "ok" else "error"
        except Exception as exc:
            logger.error("Health check – cache unreachable: %s", exc)
            return "error"
