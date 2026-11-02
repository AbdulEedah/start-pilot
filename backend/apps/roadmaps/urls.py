"""URL patterns for the roadmaps app."""
from django.urls import path

from .views import RoadmapTaskUpdateView, RoadmapView

app_name = "roadmaps"

urlpatterns = [
    path("", RoadmapView.as_view(), name="roadmap"),
    path("tasks/<int:task_id>/", RoadmapTaskUpdateView.as_view(), name="task-update"),
]
