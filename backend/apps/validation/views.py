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

    Returns 404 if the profile has not completed onboarding or if the
    report has not been generated yet.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: ValidationReportSerializer},
        summary="Retrieve the startup validation report",
    )
    def get(self, request, *args, **kwargs):
        """Return the validation report, served from cache when available."""
        cache_key = f"validation_report:user:{request.user.id}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        try:
            profile = StartupProfile.objects.get(user=request.user)
        except StartupProfile.DoesNotExist:
            raise ProfileNotFoundError()

        report = services.get_report_for_profile(profile)
        data = ValidationReportSerializer(report).data

        # Cache the serialised response to avoid repeated DB queries
        cache.set(cache_key, data, timeout=REPORT_CACHE_TTL)
        return Response(data)
