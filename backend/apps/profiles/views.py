"""
Views for the profiles app.

Endpoints:
    GET  /api/v1/profile/                   – Retrieve the user's startup profile.
    PUT  /api/v1/profile/                   – Full update of the profile.
    PATCH /api/v1/profile/                  – Partial update of the profile.
    POST /api/v1/profile/complete-onboarding/ – Trigger AI generation.
    GET  /api/v1/profile/status/            – Poll generation status.
"""
import logging

from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import OnboardingNotCompleteError

from . import services
from .models import OnboardingSession, StartupProfile
from .serializers import (
    StartupProfileSerializer,
    StartupProfileStatusSerializer,
)

logger = logging.getLogger(__name__)


class OnboardingSessionView(APIView):
    """
    POST /api/v1/profile/onboarding-session/
    GET  /api/v1/profile/onboarding-session/

    Allows unauthenticated visitors to save all onboarding chat messages,
    sector selection, and venture background data in the database
    before proceeding to create an account or register.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        session_id = request.data.get("session_id", "").strip()
        if not session_id:
            import uuid
            session_id = str(uuid.uuid4())

        sector = request.data.get("sector", "technology").strip() or "technology"
        form_data = request.data.get("form_data", {})
        chat_messages = request.data.get("chat_messages", [])

        user = request.user if request.user.is_authenticated else None

        session, created = OnboardingSession.objects.update_or_create(
            session_id=session_id,
            defaults={
                "sector": sector,
                "form_data": form_data,
                "chat_messages": chat_messages,
                "user": user,
            }
        )

        return Response({
            "status": "saved",
            "session_id": session.session_id,
            "sector": session.sector,
            "messages_count": len(session.chat_messages),
            "created": created,
        }, status=status.HTTP_200_OK)

    def get(self, request, *args, **kwargs):
        session_id = request.query_params.get("session_id", "").strip()
        if not session_id:
            return Response({"detail": "session_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = OnboardingSession.objects.get(session_id=session_id)
            return Response({
                "session_id": session.session_id,
                "sector": session.sector,
                "form_data": session.form_data,
                "chat_messages": session.chat_messages,
                "is_completed": session.is_completed,
            })
        except OnboardingSession.DoesNotExist:
            return Response({"detail": "Onboarding session not found"}, status=status.HTTP_404_NOT_FOUND)


class StartupProfileView(APIView):
    """
    GET  /api/v1/profile/   – Retrieve the authenticated user's startup profile.
    PUT  /api/v1/profile/   – Replace the profile (full update).
    PATCH /api/v1/profile/  – Partially update the profile.

    A profile is created automatically on first GET if it doesn't exist.
    """

    permission_classes = [IsAuthenticated]

    def _get_profile(self, user):
        """Retrieve or create the user's profile."""
        profile, _ = services.get_or_create_profile(user)
        return profile

    @extend_schema(
        responses={200: StartupProfileSerializer},
        summary="Retrieve or initialise the user's startup profile",
    )
    def get(self, request, *args, **kwargs):
        """Return the user's startup profile."""
        profile = self._get_profile(request.user)
        return Response(StartupProfileSerializer(profile).data)

    @extend_schema(
        request=StartupProfileSerializer,
        responses={200: StartupProfileSerializer},
        summary="Update the user's startup profile (full)",
    )
    def put(self, request, *args, **kwargs):
        """Full update – all writable fields must be provided."""
        profile = self._get_profile(request.user)

        if profile.onboarding_completed and "sector" in request.data:
            req_sec = str(request.data["sector"]).strip().lower()
            if req_sec == "social-impact":
                req_sec = "social"
            if req_sec and req_sec != profile.sector.lower():
                return Response(
                    {
                        "detail": (
                            f"Sector is permanently locked to '{profile.get_sector_display()}' for this account. "
                            "Sector switching is not permitted once onboarding is completed."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = StartupProfileSerializer(profile, data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_profile = services.update_profile(profile, serializer.validated_data)
        return Response(StartupProfileSerializer(updated_profile).data)

    @extend_schema(
        request=StartupProfileSerializer,
        responses={200: StartupProfileSerializer},
        summary="Partially update the user's startup profile",
    )
    def patch(self, request, *args, **kwargs):
        """Partial update – only the provided fields are updated."""
        profile = self._get_profile(request.user)

        if profile.onboarding_completed and "sector" in request.data:
            req_sec = str(request.data["sector"]).strip().lower()
            if req_sec == "social-impact":
                req_sec = "social"
            if req_sec and req_sec != profile.sector.lower():
                return Response(
                    {
                        "detail": (
                            f"Sector is permanently locked to '{profile.get_sector_display()}' for this account. "
                            "Sector switching is not permitted once onboarding is completed."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = StartupProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_profile = services.update_profile(profile, serializer.validated_data)
        return Response(StartupProfileSerializer(updated_profile).data)


class CompleteOnboardingView(APIView):
    """
    POST /api/v1/profile/complete-onboarding/

    Mark the startup profile's onboarding as complete and trigger
    asynchronous AI generation of the Validation Report and Roadmap.

    Idempotent: if already completed, returns the current status.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=None,
        responses={
            200: StartupProfileStatusSerializer,
            400: OpenApiResponse(description="Profile fields incomplete."),
        },
        summary="Complete onboarding and trigger AI generation",
    )
    def post(self, request, *args, **kwargs):
        """Trigger onboarding completion and AI generation pipeline."""
        profile, _ = services.get_or_create_profile(request.user)

        # Idempotent – if already triggered, just return the current status
        if profile.onboarding_completed:
            return Response(
                StartupProfileStatusSerializer(profile).data, status=status.HTTP_200_OK
            )

        try:
            profile = services.complete_onboarding(profile)
        except OnboardingNotCompleteError as exc:
            return Response({"detail": str(exc.detail)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            StartupProfileStatusSerializer(profile).data, status=status.HTTP_200_OK
        )


class ProfileStatusView(APIView):
    """
    GET /api/v1/profile/status/

    Returns the current AI generation status.
    The frontend polls this endpoint until status is 'completed' or 'failed'.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: StartupProfileStatusSerializer},
        summary="Get AI generation status",
    )
    def get(self, request, *args, **kwargs):
        """Return the current generation status for the user's profile."""
        profile, _ = services.get_or_create_profile(request.user)
        return Response(StartupProfileStatusSerializer(profile).data)
