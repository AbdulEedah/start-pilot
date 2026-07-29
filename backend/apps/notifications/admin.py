"""Django Admin for the notifications app."""
from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["user", "type", "category", "subject", "is_read", "sent_at"]
    list_filter = ["type", "category", "is_read"]
    search_fields = ["user__email", "subject"]
    readonly_fields = ["sent_at", "created_at", "updated_at"]
    actions = ["mark_as_read"]

    @admin.action(description="Mark selected notifications as read")
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
