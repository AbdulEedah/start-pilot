"""
URL patterns for the profiles app.
All routes are mounted under /api/v1/profile/ in the root URLconf.
"""
from django.urls import path

from .views import CompleteOnboardingView, ProfileStatusView, StartupProfileView

app_name = "profiles"

urlpatterns = [
    path("", StartupProfileView.as_view(), name="profile"),
    path("complete-onboarding/", CompleteOnboardingView.as_view(), name="complete-onboarding"),
    path("status/", ProfileStatusView.as_view(), name="status"),
]
