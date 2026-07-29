"""Django Admin registrations for the roadmaps app."""
from django.contrib import admin

from .models import Roadmap, RoadmapCategory, RoadmapTask


class RoadmapCategoryInline(admin.TabularInline):
    model = RoadmapCategory
    extra = 0
    show_change_link = True


class RoadmapTaskInline(admin.TabularInline):
    model = RoadmapTask
    extra = 0
    fields = ["title", "priority", "start_week", "end_week", "is_completed"]


@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    list_display = ["profile", "total_weeks", "generated_at"]
    search_fields = ["profile__user__email"]
    readonly_fields = ["generated_at", "created_at", "updated_at"]
    inlines = [RoadmapCategoryInline]


@admin.register(RoadmapCategory)
class RoadmapCategoryAdmin(admin.ModelAdmin):
    list_display = ["roadmap", "name", "order"]
    list_filter = ["name"]
    inlines = [RoadmapTaskInline]


@admin.register(RoadmapTask)
class RoadmapTaskAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "priority", "start_week", "end_week", "is_completed"]
    list_filter = ["priority", "is_completed"]
    search_fields = ["title", "category__roadmap__profile__user__email"]
