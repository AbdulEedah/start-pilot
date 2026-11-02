"""
Django Admin registration for the profiles app.
"""
from django.contrib import admin

from .models import StartupProfile


@admin.register(StartupProfile)
class StartupProfileAdmin(admin.ModelAdmin):
    """Admin interface for startup profiles."""

    list_display = [
        "user",
        "sector",
        "country",
        "team_status",
        "onboarding_completed",
        "generation_status",
        "created_at",
    ]
    list_filter = [
        "sector",
        "team_status",
        "time_commitment",
        "onboarding_completed",
        "generation_status",
    ]
    search_fields = ["user__email", "user__full_name", "country", "city"]
    readonly_fields = ["created_at", "updated_at"]
    raw_id_fields = ["user"]

    fieldsets = (
        ("Owner", {"fields": ("user",)}),
        (
            "Startup Info",
            {"fields": ("sector", "background_story", "problem")},
        ),
        (
            "Location",
            {"fields": ("country", "state", "city")},
        ),
        (
            "Founder Background",
            {"fields": ("existing_experience", "key_skills", "available_resources")},
        ),
        (
            "Team & Time",
            {"fields": ("team_status", "time_commitment")},
        ),
        (
            "Generation Status",
            {
                "fields": (
                    "onboarding_completed",
                    "generation_status",
                    "generation_error",
                )
            },
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
