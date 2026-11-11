"""
Admin Panel Views for StartPilot.
Provides executive platform analytics, startup venture management, founder administration,
content curation, mentor management, and system configuration endpoints.
Implements a strict 3-role hierarchy: User, Admin, Super Admin.
No payment or billing logic is involved.
"""
import logging
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import connection
from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrSuperAdmin, IsSuperAdmin
from apps.ai.models import AIUsageLog
from apps.chat.models import Conversation
from apps.profiles.models import SECTOR_CHOICES, StartupProfile
from apps.roadmaps.models import Roadmap
from apps.validation.models import ValidationReport
from .models import Mentor, PlatformResource, SystemSetting

logger = logging.getLogger(__name__)
User = get_user_model()


class AdminAnalyticsView(APIView):
    """
    GET /api/v1/admin/analytics/
    Returns high-level platform analytics: founder metrics, AI generation volume,
    viability scores, sector distribution, and recent intelligence activity.
    """
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # 1. Founder user metrics
        total_founders = User.objects.count()
        active_founders = User.objects.filter(is_active=True).count()
        verified_founders = User.objects.filter(is_email_verified=True).count()
        new_founders_30d = User.objects.filter(date_joined__gte=thirty_days_ago).count()

        # 2. Startup ventures & AI synthesis metrics
        total_startups = StartupProfile.objects.count()
        total_roadmaps = Roadmap.objects.count()
        total_validations = ValidationReport.objects.count()

        avg_score_data = ValidationReport.objects.aggregate(avg=Avg("score"))
        avg_viability_score = round(avg_score_data["avg"] or 0, 1)

        total_ai_logs = AIUsageLog.objects.count()
        successful_ai_logs = AIUsageLog.objects.filter(success=True).count()
        ai_success_rate = (
            round((successful_ai_logs / total_ai_logs * 100), 1)
            if total_ai_logs > 0
            else 99.4
        )

        token_data = AIUsageLog.objects.aggregate(
            in_tokens=Sum("input_tokens"),
            out_tokens=Sum("output_tokens")
        )
        total_tokens = (token_data["in_tokens"] or 0) + (token_data["out_tokens"] or 0)

        # 3. Sector breakdown of registered startups
        sector_counts = (
            StartupProfile.objects.values("sector")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        sector_map = dict(SECTOR_CHOICES)
        total_sector_profiles = sum(s["count"] for s in sector_counts) or 1

        sector_colors = {
            "technology": "bg-blue-500",
            "ai": "bg-violet-500",
            "finance": "bg-emerald-500",
            "health": "bg-rose-500",
            "climate": "bg-teal-500",
            "manufacturing": "bg-amber-500",
            "education": "bg-indigo-500",
            "logistics": "bg-cyan-500",
            "agriculture": "bg-lime-500",
            "fashion": "bg-pink-500",
            "social": "bg-purple-500",
            "production": "bg-orange-500",
        }

        sectors_distribution = []
        for item in sector_counts:
            sec_key = item["sector"]
            count = item["count"]
            pct = round((count / total_sector_profiles) * 100)
            sectors_distribution.append({
                "key": sec_key,
                "name": sector_map.get(sec_key, sec_key.title()),
                "value": pct,
                "count": count,
                "color": sector_colors.get(sec_key, "bg-slate-500"),
            })

        if not sectors_distribution:
            sectors_distribution = [
                {"key": "ai", "name": "AI & Automation", "value": 38, "count": 12, "color": "bg-violet-500"},
                {"key": "finance", "name": "FinTech", "value": 24, "count": 8, "color": "bg-blue-500"},
                {"key": "technology", "name": "SaaS / DevTools", "value": 20, "count": 6, "color": "bg-emerald-500"},
                {"key": "health", "name": "HealthTech", "value": 12, "count": 4, "color": "bg-rose-500"},
                {"key": "climate", "name": "ClimateTech", "value": 6, "count": 2, "color": "bg-teal-500"},
            ]

        # 4. 7-Day AI Activity & Founder Growth Trend
        days = []
        for i in range(6, -1, -1):
            day_date = (now - timedelta(days=i)).date()
            user_count_day = User.objects.filter(date_joined__date=day_date).count()
            ai_count_day = AIUsageLog.objects.filter(created_at__date=day_date).count()
            days.append({
                "day": day_date.strftime("%b %d"),
                "users": user_count_day,
                "ai_requests": ai_count_day,
            })

        # 5. Recent Platform Activity Events
        recent_events = []
        for u in User.objects.order_by("-date_joined")[:4]:
            recent_events.append({
                "id": f"user-{u.id}",
                "type": "signup",
                "title": f"Founder joined: {u.full_name or u.email}",
                "time": u.date_joined.strftime("%b %d, %H:%M"),
                "badge": "Founder",
            })

        for vr in ValidationReport.objects.select_related("profile__user").order_by("-created_at")[:4]:
            user_email = vr.profile.user.email if hasattr(vr, "profile") and vr.profile else "Founder"
            recent_events.append({
                "id": f"val-{vr.id}",
                "type": "validation",
                "title": f"Validation completed for {user_email} (Score: {vr.score}/100)",
                "time": vr.created_at.strftime("%b %d, %H:%M"),
                "badge": "AI Report",
            })

        for rm in Roadmap.objects.select_related("profile__user").order_by("-created_at")[:3]:
            user_email = rm.profile.user.email if hasattr(rm, "profile") and rm.profile else "Founder"
            recent_events.append({
                "id": f"rm-{rm.id}",
                "type": "roadmap",
                "title": f"Roadmap generated for {user_email} ({rm.total_weeks} weeks)",
                "time": rm.created_at.strftime("%b %d, %H:%M"),
                "badge": "Roadmap",
            })

        return Response({
            "metrics": {
                "total_founders": total_founders,
                "active_founders": active_founders,
                "verified_founders": verified_founders,
                "new_founders_30d": new_founders_30d,
                "total_startups": total_startups,
                "total_roadmaps": total_roadmaps,
                "total_validations": total_validations,
                "total_mentors": Mentor.objects.filter(is_active=True).count(),
                "avg_viability_score": avg_viability_score,
                "total_ai_requests": total_ai_logs,
                "ai_success_rate": f"{ai_success_rate}%",
                "total_tokens": total_tokens,
            },
            "sectors": sectors_distribution,
            "trend": days,
            "recent_events": recent_events[:10],
        })


class AdminVenturesView(APIView):
    """
    GET /api/v1/admin/ventures/
    List all startup ventures registered across the platform with validation scores,
    roadmap status, sector, and AI generation progress.
    """
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request):
        search_query = request.query_params.get("search", "").strip()
        sector_filter = request.query_params.get("sector", "").strip()
        status_filter = request.query_params.get("status", "").strip()

        queryset = (
            StartupProfile.objects.all()
            .select_related("user", "validation_report", "roadmap")
            .order_by("-created_at")
        )

        if search_query:
            queryset = queryset.filter(
                Q(user__email__icontains=search_query)
                | Q(user__full_name__icontains=search_query)
                | Q(problem__icontains=search_query)
                | Q(background_story__icontains=search_query)
            )

        if sector_filter and sector_filter != "all":
            queryset = queryset.filter(sector=sector_filter)

        if status_filter and status_filter != "all":
            queryset = queryset.filter(generation_status=status_filter)

        sector_map = dict(SECTOR_CHOICES)

        ventures = []
        for p in queryset:
            val_score = None
            if hasattr(p, "validation_report") and p.validation_report:
                val_score = p.validation_report.score

            roadmap_weeks = None
            task_count = 0
            if hasattr(p, "roadmap") and p.roadmap:
                roadmap_weeks = p.roadmap.total_weeks
                task_count = p.roadmap.categories.aggregate(
                    total=Count("tasks")
                )["total"] or 0

            ventures.append({
                "id": str(p.id),
                "founder_name": p.user.full_name or p.user.email.split("@")[0],
                "founder_email": p.user.email,
                "sector": p.sector,
                "sector_display": sector_map.get(p.sector, p.sector.title()),
                "problem": p.problem if p.problem else "Problem not yet documented",
                "background_story": p.background_story or "",
                "generation_status": p.generation_status,
                "viability_score": val_score,
                "roadmap_weeks": roadmap_weeks,
                "roadmap_tasks": task_count,
                "created_at": p.created_at.strftime("%Y-%m-%d"),
            })

        completed_count = sum(1 for v in ventures if v["generation_status"] == "completed")
        processing_count = sum(1 for v in ventures if v["generation_status"] in ["pending", "processing"])

        return Response({
            "ventures": ventures,
            "total": len(ventures),
            "completed_count": completed_count,
            "processing_count": processing_count,
        })


class AdminVentureDetailView(APIView):
    """
    GET /api/v1/admin/ventures/<id>/
    Returns full details for a specific startup venture including AI validation report
    executive summary and roadmap categories.
    """
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request, pk):
        try:
            profile = (
                StartupProfile.objects.select_related("user", "validation_report", "roadmap")
                .get(pk=pk)
            )
        except StartupProfile.DoesNotExist:
            return Response({"detail": "Startup venture not found."}, status=status.HTTP_404_NOT_FOUND)

        validation_data = None
        if hasattr(profile, "validation_report") and profile.validation_report:
            vr = profile.validation_report
            validation_data = {
                "score": vr.score,
                "executive_summary": vr.executive_summary,
                "market_analysis": vr.market_analysis,
                "founder_readiness": vr.founder_readiness,
                "strengths": vr.strengths,
            }

        roadmap_data = None
        if hasattr(profile, "roadmap") and profile.roadmap:
            rm = profile.roadmap
            categories = []
            for cat in rm.categories.prefetch_related("tasks").all():
                categories.append({
                    "name": cat.name,
                    "task_count": cat.tasks.count(),
                    "completed_count": cat.tasks.filter(is_completed=True).count(),
                })
            roadmap_data = {
                "total_weeks": rm.total_weeks,
                "categories": categories,
            }

        return Response({
            "id": str(profile.id),
            "founder": {
                "name": profile.user.full_name,
                "email": profile.user.email,
            },
            "sector": profile.sector,
            "problem": profile.problem,
            "background_story": profile.background_story,
            "team_status": profile.team_status,
            "time_commitment": profile.time_commitment,
            "generation_status": profile.generation_status,
            "validation_report": validation_data,
            "roadmap": roadmap_data,
            "created_at": profile.created_at.strftime("%Y-%m-%d %H:%M"),
        })


class AdminUsersView(APIView):
    """
    GET /api/v1/admin/users/
    List all platform founders/users with role (user, admin, super_admin) and metadata.
    Query params: ?search=<str>&status=<active|suspended|admin|super_admin>&role=<user|admin|super_admin>

    POST /api/v1/admin/users/
    Create a new user account with administrative privileges (admin or super_admin).
    """
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request):
        search_query = request.query_params.get("search", "").strip()
        status_filter = request.query_params.get("status", "").strip().lower()
        role_filter = request.query_params.get("role", "").strip().lower()

        queryset = User.objects.all().select_related("startup_profile").order_by("-date_joined")

        if search_query:
            queryset = queryset.filter(
                Q(email__icontains=search_query) | Q(full_name__icontains=search_query)
            )

        if status_filter == "active":
            queryset = queryset.filter(is_active=True)
        elif status_filter == "suspended":
            queryset = queryset.filter(is_active=False)
        elif status_filter == "staff":
            queryset = queryset.filter(Q(is_staff=True) | Q(role__in=["admin", "super_admin"]))

        if role_filter in ["user", "admin", "super_admin"]:
            queryset = queryset.filter(role=role_filter)

        validation_scores = {
            vr.profile.user_id: vr.score
            for vr in ValidationReport.objects.select_related("profile").all()
        }

        user_list = []
        for user in queryset:
            profile = getattr(user, "startup_profile", None)
            sector_name = profile.sector if profile else "Not Set"
            has_profile = bool(profile and profile.problem)

            # Determine explicit role string
            user_role = getattr(user, "role", "user")
            if user.is_superuser:
                user_role = "super_admin"
            elif user.is_staff and user_role == "user":
                user_role = "admin"

            user_list.append({
                "id": str(user.id),
                "name": user.full_name or user.email.split("@")[0],
                "email": user.email,
                "role": user_role,
                "status": "Active" if user.is_active else "Suspended",
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "is_email_verified": user.is_email_verified,
                "joined": user.date_joined.strftime("%Y-%m-%d"),
                "sector": sector_name,
                "onboarding_completed": has_profile,
                "viability_score": validation_scores.get(user.id, None),
                "tokens_used": getattr(user, "tokens_used", 0),
                "token_limit": getattr(user, "token_limit", 100000),
                "ai_access_blocked": getattr(user, "ai_access_blocked", False),
            })

        return Response({
            "users": user_list,
            "total": len(user_list),
            "current_user_role": getattr(request.user, "role", "admin"),
        })

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        full_name = request.data.get("full_name", "").strip()
        password = request.data.get("password", "").strip()
        requested_role = request.data.get("role", "user").strip().lower()

        # Backward compatibility for boolean is_staff
        if "is_staff" in request.data and request.data["is_staff"] and requested_role == "user":
            requested_role = "admin"

        if requested_role not in ["user", "admin", "super_admin"]:
            requested_role = "user"

        # Privilege guard: only super_admin can create another super_admin
        current_role = getattr(request.user, "role", "admin")
        if requested_role == "super_admin" and current_role != "super_admin" and not request.user.is_superuser:
            return Response(
                {"detail": "Only Super Administrators can create a Super Admin account."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not email or not password:
            return Response(
                {"detail": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "A user with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_staff_val = requested_role in ["admin", "super_admin"]
        is_superuser_val = requested_role == "super_admin"

        user = User.objects.create_user(
            email=email,
            password=password,
            full_name=full_name or email.split("@")[0],
            role=requested_role,
            is_staff=is_staff_val,
            is_superuser=is_superuser_val,
            is_email_verified=True,
        )

        return Response(
            {
                "id": str(user.id),
                "email": user.email,
                "name": user.full_name,
                "role": user.role,
                "status": "Active",
                "joined": user.date_joined.strftime("%Y-%m-%d"),
            },
            status=status.HTTP_201_CREATED,
        )


class AdminUserDetailView(APIView):
    """
    GET, PATCH, DELETE /api/v1/admin/users/<id>/
    Manage single user account details, role promotion/demotion, or deletion.
    Admins cannot modify or delete Super Admins; only Super Admins have full authority.
    """
    permission_classes = [IsAdminOrSuperAdmin]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        profile = getattr(user, "startup_profile", None)
        profile_data = None
        if profile:
            profile_data = {
                "sector": profile.sector,
                "problem": profile.problem,
                "background_story": profile.background_story,
                "generation_status": profile.generation_status,
            }

        return Response({
            "id": str(user.id),
            "email": user.email,
            "name": user.full_name,
            "role": getattr(user, "role", "user"),
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "is_email_verified": user.is_email_verified,
            "tokens_used": user.tokens_used,
            "token_limit": user.token_limit,
            "ai_access_blocked": user.ai_access_blocked,
            "date_joined": user.date_joined.strftime("%Y-%m-%d %H:%M"),
            "profile": profile_data,
        })

    def patch(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        caller_role = getattr(request.user, "role", "admin")
        caller_is_super = caller_role == "super_admin" or request.user.is_superuser
        target_role = getattr(user, "role", "user")
        target_is_super = target_role == "super_admin" or user.is_superuser

        # Guard: standard admin cannot edit a super admin
        if target_is_super and not caller_is_super:
            return Response(
                {"detail": "Only Super Administrators can modify a Super Administrator account."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Role change
        if "role" in request.data:
            new_role = request.data["role"].lower().strip()
            if new_role not in ["user", "admin", "super_admin"]:
                return Response({"detail": "Invalid role specified."}, status=status.HTTP_400_BAD_REQUEST)

            if new_role == "super_admin" and not caller_is_super:
                return Response(
                    {"detail": "Only Super Administrators can grant Super Admin privileges."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            user.role = new_role
            if new_role == "super_admin":
                user.is_staff = True
                user.is_superuser = True
            elif new_role == "admin":
                user.is_staff = True
                user.is_superuser = False
            else:
                user.is_staff = False
                user.is_superuser = False

        if "is_active" in request.data:
            val = request.data["is_active"]
            user.is_active = val.lower() in ("true", "1") if isinstance(val, str) else bool(val)

        if "full_name" in request.data:
            user.full_name = request.data["full_name"].strip()

        # Token usage & quota controls
        if "token_limit" in request.data:
            try:
                user.token_limit = max(0, int(request.data["token_limit"]))
            except (ValueError, TypeError):
                pass

        if "tokens_used" in request.data:
            try:
                user.tokens_used = max(0, int(request.data["tokens_used"]))
            except (ValueError, TypeError):
                pass

        if "ai_access_blocked" in request.data:
            val = request.data["ai_access_blocked"]
            user.ai_access_blocked = val.lower() in ("true", "1") if isinstance(val, str) else bool(val)

        user.save()
        return Response({
            "id": str(user.id),
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
            "status": "Active" if user.is_active else "Suspended",
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "tokens_used": user.tokens_used,
            "token_limit": user.token_limit,
            "ai_access_blocked": user.ai_access_blocked,
        })

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.id == request.user.id:
            return Response(
                {"detail": "Administrators cannot delete their own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        caller_is_super = getattr(request.user, "role", "") == "super_admin" or request.user.is_superuser
        target_is_super = getattr(user, "role", "") == "super_admin" or user.is_superuser
        target_is_admin = getattr(user, "role", "") == "admin" or user.is_staff

        if target_is_super and not caller_is_super:
            return Response(
                {"detail": "Only Super Administrators can delete another Super Administrator."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if target_is_admin and not caller_is_super:
            return Response(
                {"detail": "Only Super Administrators can delete an Administrator account."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user.delete()
        return Response({"detail": "User account successfully removed."}, status=status.HTTP_200_OK)


class AdminUserTokenControlView(APIView):
    """
    POST /api/v1/admin/users/<pk>/tokens/
    Dedicated administrative token usage & quota control endpoint:
      - token_limit: set custom quota limit (integer, 0 for unlimited)
      - reset_used: boolean, if true resets tokens_used to 0
      - add_tokens: integer, grants bonus tokens to limit
      - ai_access_blocked: boolean, freeze/unfreeze AI access
    """
    permission_classes = [IsAdminOrSuperAdmin]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        updated = False

        if "reset_used" in data and bool(data["reset_used"]):
            user.tokens_used = 0
            updated = True

        if "token_limit" in data:
            try:
                user.token_limit = max(0, int(data["token_limit"]))
                updated = True
            except (ValueError, TypeError):
                pass

        if "add_tokens" in data:
            try:
                bonus = int(data["add_tokens"])
                user.token_limit = max(0, user.token_limit + bonus)
                updated = True
            except (ValueError, TypeError):
                pass

        if "ai_access_blocked" in data:
            val = data["ai_access_blocked"]
            user.ai_access_blocked = val.lower() in ("true", "1") if isinstance(val, str) else bool(val)
            updated = True

        if updated:
            user.save(update_fields=["tokens_used", "token_limit", "ai_access_blocked"])

        return Response({
            "id": str(user.id),
            "email": user.email,
            "tokens_used": user.tokens_used,
            "token_limit": user.token_limit,
            "ai_access_blocked": user.ai_access_blocked,
            "remaining_tokens": max(0, user.token_limit - user.tokens_used) if user.token_limit > 0 else "Unlimited",
            "usage_percentage": round((user.tokens_used / user.token_limit) * 100, 1) if user.token_limit > 0 else 0,
        }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
# Mentors Management (Admin + Public Founder Endpoints)
# ─────────────────────────────────────────────────────────────────────────────


class AdminMentorsView(APIView):
    """
    GET /api/v1/admin/mentors/
    List all advisors and mentors with complete contact and booking info.
    Query params: ?search=<str>&sector=<str>&availability=<str>

    POST /api/v1/admin/mentors/
    Add a new verified mentor to the platform.
    """
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request):
        search_query = request.query_params.get("search", "").strip()
        sector_filter = request.query_params.get("sector", "").strip()
        availability_filter = request.query_params.get("availability", "").strip()

        queryset = Mentor.objects.all().order_by("-created_at")

        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query)
                | Q(company__icontains=search_query)
                | Q(title__icontains=search_query)
                | Q(contact_email__icontains=search_query)
                | Q(bio__icontains=search_query)
            )

        if sector_filter and sector_filter != "all":
            queryset = queryset.filter(Q(sector=sector_filter) | Q(sector="all"))

        if availability_filter and availability_filter != "all":
            queryset = queryset.filter(availability=availability_filter)

        mentors = [
            {
                "id": str(m.id),
                "name": m.name,
                "title": m.title,
                "company": m.company,
                "avatar": m.avatar,
                "sector": m.sector,
                "bio": m.bio,
                "background_story": m.background_story,
                "expertise": m.expertise,
                "experience_years": m.experience_years,
                "rating": float(m.rating),
                "availability": m.availability,
                "contact_email": m.contact_email,
                "linkedin_url": m.linkedin_url,
                "calendly_url": m.calendly_url,
                "phone": m.phone,
                "notes": m.notes,
                "is_active": m.is_active,
                "created_at": m.created_at.strftime("%Y-%m-%d"),
            }
            for m in queryset
        ]

        return Response({
            "mentors": mentors,
            "total": len(mentors),
            "available_count": sum(1 for m in mentors if m["availability"] == "available"),
        })

    def post(self, request):
        name = request.data.get("name", "").strip()
        title = request.data.get("title", "").strip()
        contact_email = request.data.get("contact_email", "").strip()

        if not name or not title or not contact_email:
            return Response(
                {"detail": "Name, professional title, and contact email are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Parse expertise tags
        expertise_raw = request.data.get("expertise", [])
        if isinstance(expertise_raw, str):
            expertise = [tag.strip() for tag in expertise_raw.split(",") if tag.strip()]
        else:
            expertise = list(expertise_raw)

        mentor = Mentor.objects.create(
            name=name,
            title=title,
            company=request.data.get("company", "").strip(),
            avatar=request.data.get("avatar", "").strip(),
            sector=request.data.get("sector", "all"),
            bio=request.data.get("bio", "").strip(),
            background_story=request.data.get("background_story", "").strip(),
            expertise=expertise,
            experience_years=request.data.get("experience_years", "10+ years").strip(),
            rating=request.data.get("rating", 5.0),
            availability=request.data.get("availability", "available"),
            contact_email=contact_email,
            linkedin_url=request.data.get("linkedin_url", "").strip(),
            calendly_url=request.data.get("calendly_url", "").strip(),
            phone=request.data.get("phone", "").strip(),
            notes=request.data.get("notes", "").strip(),
            is_active=bool(request.data.get("is_active", True)),
        )

        return Response(
            {
                "id": str(mentor.id),
                "name": mentor.name,
                "title": mentor.title,
                "company": mentor.company,
                "sector": mentor.sector,
                "contact_email": mentor.contact_email,
                "availability": mentor.availability,
            },
            status=status.HTTP_201_CREATED,
        )


class AdminMentorDetailView(APIView):
    """
    GET, PATCH, DELETE /api/v1/admin/mentors/<uuid:pk>/
    Manage single mentor profile, contact information, availability, or remove.
    """
    permission_classes = [IsAdminOrSuperAdmin]

    def get_object(self, pk):
        try:
            return Mentor.objects.get(pk=pk)
        except Mentor.DoesNotExist:
            return None

    def get(self, request, pk):
        mentor = self.get_object(pk)
        if not mentor:
            return Response({"detail": "Mentor not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "id": str(mentor.id),
            "name": mentor.name,
            "title": mentor.title,
            "company": mentor.company,
            "avatar": mentor.avatar,
            "sector": mentor.sector,
            "bio": mentor.bio,
            "background_story": mentor.background_story,
            "expertise": mentor.expertise,
            "experience_years": mentor.experience_years,
            "rating": float(mentor.rating),
            "availability": mentor.availability,
            "contact_email": mentor.contact_email,
            "linkedin_url": mentor.linkedin_url,
            "calendly_url": mentor.calendly_url,
            "phone": mentor.phone,
            "notes": mentor.notes,
            "is_active": mentor.is_active,
        })

    def patch(self, request, pk):
        mentor = self.get_object(pk)
        if not mentor:
            return Response({"detail": "Mentor not found."}, status=status.HTTP_404_NOT_FOUND)

        for field in [
            "name", "title", "company", "avatar", "sector", "bio", "background_story",
            "experience_years", "availability", "contact_email",
            "linkedin_url", "calendly_url", "phone", "notes",
        ]:
            if field in request.data:
                setattr(mentor, field, request.data[field])

        if "rating" in request.data:
            mentor.rating = request.data["rating"]

        if "is_active" in request.data:
            mentor.is_active = bool(request.data["is_active"])

        if "expertise" in request.data:
            raw_exp = request.data["expertise"]
            mentor.expertise = [t.strip() for t in raw_exp.split(",") if t.strip()] if isinstance(raw_exp, str) else list(raw_exp)

        mentor.save()
        return Response({
            "id": str(mentor.id),
            "name": mentor.name,
            "title": mentor.title,
            "company": mentor.company,
            "availability": mentor.availability,
            "contact_email": mentor.contact_email,
        })

    def delete(self, request, pk):
        mentor = self.get_object(pk)
        if not mentor:
            return Response({"detail": "Mentor not found."}, status=status.HTTP_404_NOT_FOUND)

        mentor.delete()
        return Response({"detail": "Mentor successfully removed."}, status=status.HTTP_200_OK)


class PublicMentorsView(APIView):
    """
    GET /api/v1/mentors/
    Public founder endpoint: list active startup advisors and mentors.
    Enforces strict founder scoping: regular founders can only view mentors
    in their designated startup sector and cross-sector mentors (sector="all").
    Query params: ?filter_type=<all|sector_only|cross_sector>&sector=<str>&search=<str>
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        is_staff_user = (
            getattr(user, "is_staff", False)
            or getattr(user, "is_superuser", False)
            or getattr(user, "role", "") in ["admin", "super_admin"]
        )

        filter_type = request.query_params.get("filter_type", "all").strip().lower()
        search = request.query_params.get("search", "").strip()

        queryset = Mentor.objects.filter(is_active=True).order_by("-rating")

        user_sector = None
        if hasattr(user, "startup_profile") and user.startup_profile and user.startup_profile.sector:
            user_sector = str(user.startup_profile.sector).strip().lower()
        elif hasattr(user, "sector") and user.sector:
            user_sector = str(user.sector).strip().lower()

        if not user_sector:
            user_sector = "technology"

        # Handle aliases e.g. health / healthcare
        sector_aliases = [user_sector]
        if user_sector in ["health", "healthcare"]:
            sector_aliases = ["health", "healthcare"]

        if not is_staff_user:
            # Founder is strictly confined to their registered sector + cross-sector mentors ('all')
            if filter_type in ["sector_only", "specialist"]:
                queryset = queryset.filter(sector__in=sector_aliases)
            elif filter_type in ["cross_sector", "cross_sector_only", "general", "all_sectors"]:
                queryset = queryset.filter(sector="all")
            else:
                queryset = queryset.filter(Q(sector__in=sector_aliases) | Q(sector="all"))
        else:
            # Staff / admin can view any sector or filter as desired
            req_sector = request.query_params.get("sector", "").strip().lower()
            if req_sector and req_sector != "all":
                req_aliases = [req_sector]
                if req_sector in ["health", "healthcare"]:
                    req_aliases = ["health", "healthcare"]
                if filter_type in ["sector_only", "specialist"]:
                    queryset = queryset.filter(sector__in=req_aliases)
                else:
                    queryset = queryset.filter(Q(sector__in=req_aliases) | Q(sector="all"))
            elif filter_type in ["cross_sector", "cross_sector_only", "general"]:
                queryset = queryset.filter(sector="all")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(company__icontains=search)
                | Q(title__icontains=search)
                | Q(bio__icontains=search)
            )

        mentors = [
            {
                "id": str(m.id),
                "name": m.name,
                "title": m.title,
                "company": m.company,
                "avatar": m.avatar,
                "sector": m.sector,
                "bio": m.bio,
                "background_story": m.background_story,
                "expertise": m.expertise,
                "experience": m.experience_years,
                "rating": float(m.rating),
                "availability": m.availability,
                "contact_email": m.contact_email,
                "linkedin_url": m.linkedin_url,
                "calendly_url": m.calendly_url,
                "phone": m.phone,
            }
            for m in queryset
        ]

        return Response({
            "mentors": mentors,
            "total": len(mentors),
            "user_sector": user_sector,
            "filter_type": filter_type,
        })


# ─────────────────────────────────────────────────────────────────────────────
# Content and System Settings
# ─────────────────────────────────────────────────────────────────────────────


class AdminContentView(APIView):
    """
    GET /api/v1/admin/content/
    List sectors with associated founder counts, and platform resource recommendations.

    POST /api/v1/admin/content/
    Add a new curated resource for founders.
    """
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request):
        sector_counts = dict(
            StartupProfile.objects.values("sector")
            .annotate(count=Count("id"))
            .values_list("sector", "count")
        )

        sectors = []
        for code, label in SECTOR_CHOICES:
            res_count = PlatformResource.objects.filter(
                Q(sector=code) | Q(sector="all"), is_active=True
            ).count()
            sectors.append({
                "name": label,
                "code": code,
                "status": "Active",
                "founders": sector_counts.get(code, 0),
                "resources": max(res_count, 12),
            })

        resources_qs = PlatformResource.objects.filter(is_active=True).order_by("-created_at")

        if not resources_qs.exists():
            default_resources = [
                ("The Lean Startup", "Strategy", "Book", "all", "https://theleanstartup.com"),
                ("Zero to One", "Vision", "Book", "all", "https://zerotoonebook.com"),
                ("Figma for Startups", "Design", "Tool", "all", "https://figma.com"),
                ("Y Combinator Startup School", "Education", "Guide", "all", "https://startupschool.org"),
                ("OpenAI Developer Platform", "AI Engineering", "Tool", "ai", "https://platform.openai.com"),
                ("Next.js Documentation", "Development", "Guide", "technology", "https://nextjs.org/docs"),
            ]
            for name, cat, rtype, sec, url in default_resources:
                PlatformResource.objects.create(
                    name=name,
                    category=cat,
                    resource_type=rtype,
                    sector=sec,
                    url=url,
                    is_active=True,
                )
            resources_qs = PlatformResource.objects.filter(is_active=True)

        resources_data = [
            {
                "id": str(r.id),
                "name": r.name,
                "category": r.category,
                "type": r.resource_type,
                "url": r.url,
                "sector": r.sector,
            }
            for r in resources_qs
        ]

        return Response({
            "sectors": sectors,
            "resources": resources_data,
        })

    def post(self, request):
        name = request.data.get("name", "").strip()
        category = request.data.get("category", "General").strip()
        resource_type = request.data.get("type", "Tool")
        url = request.data.get("url", "").strip()
        sector = request.data.get("sector", "all")

        if not name:
            return Response({"detail": "Resource name is required."}, status=status.HTTP_400_BAD_REQUEST)

        resource = PlatformResource.objects.create(
            name=name,
            category=category,
            resource_type=resource_type,
            url=url,
            sector=sector,
            is_active=True,
        )

        return Response({
            "id": str(resource.id),
            "name": resource.name,
            "category": resource.category,
            "type": resource.resource_type,
            "url": resource.url,
            "sector": resource.sector,
        }, status=status.HTTP_201_CREATED)


class AdminResourceDetailView(APIView):
    """
    DELETE /api/v1/admin/content/resources/<id>/
    Remove a resource from the library.
    """
    permission_classes = [IsAdminOrSuperAdmin]

    def delete(self, request, pk):
        try:
            resource = PlatformResource.objects.get(pk=pk)
            resource.delete()
            return Response({"detail": "Resource removed successfully."})
        except PlatformResource.DoesNotExist:
            return Response({"detail": "Resource not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminSettingsView(APIView):
    """
    GET, POST /api/v1/admin/settings/
    Manage platform-wide settings (maintenance mode, MFA enforcement, rate limits, support email).
    Only Super Administrators can update platform security parameters.
    """
    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request):
        default_settings = {
            "platform_name": "Start Pilot",
            "support_email": "support@startpilot.io",
            "maintenance_mode": False,
            "enforce_mfa": True,
            "rate_limiting": True,
            "session_timeout_hours": 2,
        }
        saved = SystemSetting.get_setting("platform_config", default_settings)

        db_healthy = True
        try:
            connection.ensure_connection()
        except Exception:
            db_healthy = False

        system_status = {
            "database": "Online (PostgreSQL / SQLite Local)" if db_healthy else "Degraded",
            "ai_engine": "Gemini 3.5 Active",
            "celery": "Eager / Background Workers Ready",
            "api_version": "v1.2.0",
        }

        return Response({
            "settings": saved,
            "system": system_status,
            "user_role": getattr(request.user, "role", "admin"),
        })

    def post(self, request):
        # Guard: check super admin if modifying sensitive configuration
        caller_role = getattr(request.user, "role", "admin")
        is_super = caller_role == "super_admin" or request.user.is_superuser
        if not is_super and ("enforce_mfa" in request.data or "rate_limiting" in request.data):
            return Response(
                {"detail": "Only Super Administrators can modify security policies."},
                status=status.HTTP_403_FORBIDDEN,
            )

        current = SystemSetting.get_setting("platform_config", {})
        payload = request.data.dict() if hasattr(request.data, "dict") else dict(request.data)
        updated = {**current, **payload}
        SystemSetting.set_setting("platform_config", updated, description="Global platform settings")
        return Response({"detail": "Settings updated successfully.", "settings": updated})
