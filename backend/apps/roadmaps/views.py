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
                if profile.sector != new_sec:
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
