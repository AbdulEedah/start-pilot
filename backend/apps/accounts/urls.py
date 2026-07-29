"""
URL patterns for the accounts app.
All routes are mounted under /api/v1/auth/ in the root URLconf.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    EmailVerifyView,
    GoogleOAuthView,
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
)

app_name = "accounts"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("google/", GoogleOAuthView.as_view(), name="google-oauth"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("verify-email/", EmailVerifyView.as_view(), name="verify-email"),
]
