from django.contrib import admin
from .models import SystemSetting, PlatformResource, Mentor


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ["key", "value", "updated_at"]
    search_fields = ["key"]


@admin.register(PlatformResource)
class PlatformResourceAdmin(admin.ModelAdmin):
    list_display = ["name", "resource_type", "category", "sector", "is_active", "created_at"]
    list_filter = ["resource_type", "sector", "is_active"]
    search_fields = ["name", "category", "description"]


@admin.register(Mentor)
class MentorAdmin(admin.ModelAdmin):
    list_display = ["name", "title", "company", "sector", "contact_email", "availability", "is_active"]
    list_filter = ["sector", "availability", "is_active"]
    search_fields = ["name", "title", "company", "contact_email", "bio"]
