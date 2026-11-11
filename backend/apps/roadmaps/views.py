"""
Views for the roadmaps app.

Endpoints:
    GET   /api/v1/roadmap/              – Full roadmap with categories and tasks.
    POST  /api/v1/roadmap/              – Generate or re-generate the startup roadmap.
    PATCH /api/v1/roadmap/tasks/{id}/   – Update task completion and notes.
"""
import logging

from django.core.cache import cache
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.exceptions import ProfileNotFoundError, ReportNotReadyError
from apps.profiles.models import StartupProfile

from . import services
from .models import RoadmapTask
from .serializers import RoadmapSerializer, RoadmapTaskSerializer, RoadmapTaskUpdateSerializer

logger = logging.getLogger(__name__)

ROADMAP_CACHE_TTL = 86400  # 24 hours


class RoadmapView(APIView):
    """
    GET  /api/v1/roadmap/ – Returns the full roadmap with all categories and tasks.
    POST /api/v1/roadmap/ – Generate or re-generate the roadmap.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: RoadmapSerializer},
        summary="Retrieve the full startup roadmap",
    )
    def get(self, request, *args, **kwargs):
        """Return the cached or freshly fetched roadmap."""
        cache_key = f"roadmap:user:{request.user.id}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        try:
            profile = StartupProfile.objects.get(user=request.user)
        except StartupProfile.DoesNotExist:
            raise ProfileNotFoundError()

        try:
            roadmap = services.get_roadmap_for_profile(profile)
        except Exception:
            raise ReportNotReadyError(detail="Roadmap is not ready yet.")

        data = RoadmapSerializer(roadmap).data
        cache.set(cache_key, data, timeout=ROADMAP_CACHE_TTL)
        return Response(data)

    @extend_schema(
        responses={201: RoadmapSerializer},
        summary="Generate or re-generate the startup roadmap",
    )
    def post(self, request, *args, **kwargs):
        """Generate or re-generate the roadmap for the user's startup."""
        from apps.profiles.models import SECTOR_CHOICES, DEFAULT_AVAILABLE_RESOURCES
        from apps.validation.models import ValidationReport
        from apps.validation.services import generate_validation_report

        profile = StartupProfile.objects.filter(user=request.user).first()
        industry = (request.data.get("industry") or request.data.get("sector") or "").lower().strip()
        startup_name = request.data.get("startup_name")
        description = request.data.get("description")

        def resolve_sector(name):
            if not name:
                return "technology"
            for code, label in SECTOR_CHOICES:
                if code == name or code in name or label.lower() in name:
                    return code
            return "technology"

        if not profile:
            profile = StartupProfile.objects.create(
                user=request.user,
                sector=resolve_sector(industry),
                background_story=startup_name or "Startup idea",
                problem=description or "Solving key customer challenges",
                country="Global",
                city="Online",
                team_status="solo",
                time_commitment="full",
                available_resources=DEFAULT_AVAILABLE_RESOURCES,
            )
        else:
            changed = False
            if industry:
                new_sec = resolve_sector(industry)
                # Only update sector if profile.sector is not set or if industry explicitly specifies a valid non-default sector
                if not profile.sector:
                    profile.sector = new_sec
                    changed = True
                elif new_sec != "technology" and profile.sector != new_sec:
                    profile.sector = new_sec
                    changed = True
            if startup_name and (not profile.background_story or profile.background_story == "Startup idea"):
                profile.background_story = startup_name
                changed = True
            if description and (not profile.problem or profile.problem == "Solving key customer challenges"):
                profile.problem = description
                changed = True
            if changed:
                profile.save()

        report = ValidationReport.objects.filter(profile=profile).first()
        if not report:
            report = generate_validation_report(profile)

        roadmap = services.generate_roadmap(profile, report)
        cache.delete(f"roadmap:user:{request.user.id}")
        data = RoadmapSerializer(roadmap).data
        return Response(data, status=status.HTTP_201_CREATED)


class RoadmapTaskUpdateView(APIView):
    """
    PATCH /api/v1/roadmap/tasks/{task_id}/

    Update a task's completion status and/or personal notes.
    Only the owner of the task's roadmap may update it.
    """

    permission_classes = [IsAuthenticated]

    def _get_task_for_user(self, task_id: int, user):
        """
        Retrieve the task, verifying it belongs to the requesting user.
        Returns 404 if the task doesn't exist or doesn't belong to the user.
        """
        try:
            return RoadmapTask.objects.select_related(
                "category__roadmap__profile__user"
            ).get(
                pk=task_id,
                category__roadmap__profile__user=user,
            )
        except RoadmapTask.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound("Task not found.")

    @extend_schema(
        request=RoadmapTaskUpdateSerializer,
        responses={200: RoadmapTaskSerializer},
        summary="Update a roadmap task (completion / notes)",
    )
    def patch(self, request, task_id: int, *args, **kwargs):
        """Partially update a roadmap task."""
        task = self._get_task_for_user(task_id, request.user)

        serializer = RoadmapTaskUpdateSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Invalidate the roadmap cache so the next GET reflects the update
        cache.delete(f"roadmap:user:{request.user.id}")

        return Response(RoadmapTaskSerializer(task).data, status=status.HTTP_200_OK)


class RoadmapExportView(APIView):
    """
    POST /api/v1/roadmap/export/
    Send the founder's roadmap as an email with an attached PDF blueprint.

    GET /api/v1/roadmap/export/?download=true
    Download the roadmap as a PDF blueprint directly.
    """

    permission_classes = [IsAuthenticated]

    def _get_roadmap_and_profile(self, user):
        profile = StartupProfile.objects.filter(user=user).first()
        if not profile:
            raise ProfileNotFoundError()
        try:
            roadmap = services.get_roadmap_for_profile(profile)
        except Exception:
            raise ReportNotReadyError(detail="Roadmap is not ready yet. Please generate a roadmap first.")
        return roadmap, profile

    @extend_schema(
        summary="Export roadmap blueprint as PDF via email",
    )
    def post(self, request, *args, **kwargs):
        from django.conf import settings
        from django.core.mail import EmailMessage
        from .pdf import generate_roadmap_pdf

        roadmap, profile = self._get_roadmap_and_profile(request.user)
        recipient_email = request.data.get("email") or request.user.email

        try:
            pdf_bytes = generate_roadmap_pdf(roadmap, profile, request.user)
        except Exception as exc:
            logger.error("Failed to generate PDF for roadmap: %s", exc)
            return Response(
                {"detail": f"Failed to generate PDF blueprint: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        sector_label = profile.get_sector_display() if hasattr(profile, "get_sector_display") else profile.sector
        startup_title = getattr(profile, "background_story", "") or "Startup Venture"
        if len(startup_title) > 50:
            startup_title = startup_title[:47] + "..."

        subject = f"Your Start Pilot Roadmap Blueprint — {sector_label}"
        body = (
            f"Hi {request.user.full_name or 'Founder'},\n\n"
            f"Attached is your complete Start Pilot Startup Roadmap Blueprint ({sector_label} sector).\n\n"
            f"Venture: {startup_title}\n"
            f"Timeline: {roadmap.total_weeks} weeks\n\n"
            f"Review your milestones, execute with speed, and reach out to our AI Copilot or Mentors anytime.\n\n"
            f"Best regards,\nThe Start Pilot Team"
        )

        try:
            email = EmailMessage(
                subject=subject,
                body=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient_email],
            )
            clean_sector = "".join(c for c in str(sector_label) if c.isalnum() or c in ("-", "_"))
            email.attach(
                filename=f"StartPilot_Roadmap_{clean_sector}.pdf",
                content=pdf_bytes,
                mimetype="application/pdf",
            )
            email.send(fail_silently=False)
            logger.info("Roadmap PDF emailed to %s", recipient_email)
        except Exception as exc:
            logger.warning("Email sending failed (%s). Continuing with direct PDF availability.", exc)
            return Response(
                {
                    "detail": f"Email dispatch failed ({exc}), but your blueprint PDF was created successfully.",
                    "email": recipient_email,
                    "download_url": "/api/v1/roadmap/export/?download=true",
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "detail": f"Roadmap PDF blueprint has been successfully sent to {recipient_email}.",
                "email": recipient_email,
                "download_url": "/api/v1/roadmap/export/?download=true",
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="Download roadmap blueprint directly as PDF",
    )
    def get(self, request, *args, **kwargs):
        from django.http import HttpResponse
        from .pdf import generate_roadmap_pdf

        roadmap, profile = self._get_roadmap_and_profile(request.user)
        pdf_bytes = generate_roadmap_pdf(roadmap, profile, request.user)

        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        sector_label = profile.get_sector_display() if hasattr(profile, "get_sector_display") else profile.sector
        clean_sector = "".join(c for c in str(sector_label) if c.isalnum() or c in ("-", "_"))
        response["Content-Disposition"] = f'attachment; filename="StartPilot_Roadmap_{clean_sector}.pdf"'
        return response
