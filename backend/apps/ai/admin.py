"""
Django Admin registrations for the ai app.
"""
from django.contrib import admin

from .models import AIUsageLog, PromptTemplate


@admin.register(PromptTemplate)
class PromptTemplateAdmin(admin.ModelAdmin):
    """Admin interface for PromptTemplate – manage prompts from the dashboard."""

    list_display = ["name", "version", "is_active", "created_at", "updated_at"]
    list_filter = ["name", "is_active"]
    search_fields = ["name", "system_prompt"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["name", "-version"]

    fieldsets = (
        (None, {"fields": ("name", "version", "is_active")}),
        ("Prompts", {"fields": ("system_prompt", "user_prompt_template")}),
        ("Few-shot Examples", {"fields": ("few_shot_examples",)}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(AIUsageLog)
class AIUsageLogAdmin(admin.ModelAdmin):
    """Read-only admin for AI usage logs."""

    list_display = [
        "user",
        "provider",
        "task_type",
        "input_tokens",
        "output_tokens",
        "request_duration",
        "success",
        "created_at",
    ]
    list_filter = ["provider", "task_type", "success", "created_at"]
    search_fields = ["user__email", "task_type"]
    readonly_fields = [f.name for f in AIUsageLog._meta.get_fields()]

    def has_add_permission(self, request):
        """Logs are created by the system only."""
        return False

    def has_change_permission(self, request, obj=None):
        """Logs are immutable."""
        return False
