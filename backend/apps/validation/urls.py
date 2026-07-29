"""URL patterns for the validation app."""
from django.urls import path

from .views import ValidationReportView

app_name = "validation"

urlpatterns = [
    path("", ValidationReportView.as_view(), name="report"),
]
