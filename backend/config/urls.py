"""
Root URL configuration for StartPilot.
All app-level URLs are versioned under /api/v1/.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from apps.admin_panel.views import PublicMentorsView

urlpatterns = [
    # Django Admin
    path("admin/", admin.site.urls),

    # API v1
    path("api/v1/auth/", include("apps.accounts.urls", namespace="accounts")),
    path("api/v1/profile/", include("apps.profiles.urls", namespace="profiles")),
    path("api/v1/validation-report/", include("apps.validation.urls", namespace="validation")),
    path("api/v1/roadmap/", include("apps.roadmaps.urls", namespace="roadmaps")),
    path("api/v1/chat/", include("apps.chat.urls", namespace="chat")),
    path("api/v1/notifications/", include("apps.notifications.urls", namespace="notifications")),
    path("api/v1/admin/", include("apps.admin_panel.urls", namespace="admin_panel")),
    path("api/v1/mentors/", PublicMentorsView.as_view(), name="public-mentors"),
    path("api/v1/", include("apps.core.urls", namespace="core")),

    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    # Prometheus metrics
    path("", include("django_prometheus.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
