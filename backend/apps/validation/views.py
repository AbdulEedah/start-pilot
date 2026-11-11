"""
Views for the validation app.

Endpoints:
    GET /api/v1/validation-report/ – Retrieve the user's validation report.
"""
import logging

from django.core.cache import cache
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import ProfileNotFoundError, ReportNotReadyError
from apps.profiles.models import StartupProfile

from . import services
from .serializers import ValidationReportSerializer

logger = logging.getLogger(__name__)

# Cache report responses for 24 hours
REPORT_CACHE_TTL = 86400


class ValidationReportView(APIView):
    """
    GET /api/v1/validation-report/

    Return the AI-generated validation report for the authenticated user's
    startup profile.
    Automatically generates report if not yet created.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: ValidationReportSerializer},
        summary="Retrieve the startup validation report",
    )
    def get(self, request, *args, **kwargs):
        """Return the validation report, generating automatically if needed."""
        cache_key = f"validation_report:user:{request.user.id}"
        force = request.query_params.get("force", "false").lower() == "true"

        if not force:
            cached = cache.get(cache_key)
            if cached:
                return Response(cached)

        profile, _ = StartupProfile.objects.get_or_create(
            user=request.user,
            defaults={"sector": "technology", "problem": "Startup venture idea", "city": "Global"}
        )

        try:
            report = services.get_report_for_profile(profile)
        except ReportNotReadyError:
            try:
                report = services.generate_validation_report(profile)
            except Exception as exc:
                logger.warning("Automatic validation generation failed, generating fallback: %s", exc)
                report = services.generate_fallback_validation_report(profile)

        data = ValidationReportSerializer(report).data

        # Cache the serialised response to avoid repeated DB queries
        cache.set(cache_key, data, timeout=REPORT_CACHE_TTL)
        return Response(data)


class ReanalyzeValidationView(APIView):
    """
    POST /api/v1/validation-report/reanalyze/

    Forces re-analysis and fresh generation of the venture viability report.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        cache_key = f"validation_report:user:{request.user.id}"
        cache.delete(cache_key)

        profile, _ = StartupProfile.objects.get_or_create(
            user=request.user,
            defaults={"sector": "technology", "problem": "Startup venture idea", "city": "Global"}
        )

        try:
            report = services.generate_validation_report(profile)
        except Exception as exc:
            logger.warning("Re-analyze generation failed, generating fallback: %s", exc)
            report = services.generate_fallback_validation_report(profile)

        data = ValidationReportSerializer(report).data
        cache.set(cache_key, data, timeout=REPORT_CACHE_TTL)
        return Response(data)
