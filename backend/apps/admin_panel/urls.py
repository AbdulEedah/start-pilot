"""
URL routing for Admin Panel API endpoints.
All routes are mounted under /api/v1/admin/ and require staff permissions.
"""
from django.urls import path
from .views import (
    AdminAnalyticsView,
    AdminVenturesView,
    AdminVentureDetailView,
    AdminUsersView,
    AdminUserDetailView,
    AdminMentorsView,
    AdminMentorDetailView,
    AdminContentView,
    AdminResourceDetailView,
    AdminSettingsView,
)

app_name = "admin_panel"

urlpatterns = [
    path("analytics/", AdminAnalyticsView.as_view(), name="analytics"),
    path("ventures/", AdminVenturesView.as_view(), name="ventures-list"),
    path("ventures/<uuid:pk>/", AdminVentureDetailView.as_view(), name="venture-detail"),
    path("users/", AdminUsersView.as_view(), name="users-list"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="user-detail"),
    path("mentors/", AdminMentorsView.as_view(), name="mentors-list"),
    path("mentors/<uuid:pk>/", AdminMentorDetailView.as_view(), name="mentor-detail"),
    path("content/", AdminContentView.as_view(), name="content"),
    path("content/resources/<uuid:pk>/", AdminResourceDetailView.as_view(), name="resource-detail"),
    path("settings/", AdminSettingsView.as_view(), name="settings"),
]
