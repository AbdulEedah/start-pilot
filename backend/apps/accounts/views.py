"""
Views (API endpoints) for the accounts app.

All business logic is delegated to services.py.
Views are intentionally thin – they handle request/response only.
"""
import logging

from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from . import services
from .serializers import (
    EmailVerifySerializer,
    GoogleOAuthSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    """
    POST /api/v1/auth/register/

    Create a new user account and auto-login.
    Returns JWT access + refresh tokens and user data.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=RegisterSerializer,
        responses={201: LoginSerializer},
        summary="Register a new user and auto-login",
    )
    def post(self, request, *args, **kwargs):
        """Validate payload, create user, return user data with tokens."""
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = services.register_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            full_name=serializer.validated_data["full_name"],
        )

        # Auto-login: generate JWT tokens for the newly created user
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        from .serializers import UserSerializer
        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    POST /api/v1/auth/login/

    Authenticate with email and password.
    Returns JWT access + refresh tokens and user data.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={200: LoginSerializer},
        summary="Login with email and password",
    )
    def post(self, request, *args, **kwargs):
        """Validate credentials and return tokens."""
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class GoogleOAuthView(APIView):
    """
    POST /api/v1/auth/google/

    Exchange a Google OAuth authorisation code for JWT tokens.
    The frontend obtains the code via Google's popup/redirect flow.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=GoogleOAuthSerializer,
        responses={200: LoginSerializer},
        summary="Login or register via Google OAuth",
    )
    def post(self, request, *args, **kwargs):
        """Exchange Google code for JWT tokens."""
        serializer = GoogleOAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            result = services.google_oauth_login(code=serializer.validated_data["code"])
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(result, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/

    Blacklist the provided refresh token, effectively logging the user out.
    The access token will expire naturally.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        request={"application/json": {"type": "object", "properties": {"refresh": {"type": "string"}}}},
        responses={204: None},
        summary="Logout and blacklist refresh token",
    )
    def post(self, request, *args, **kwargs):
        """Blacklist the refresh token."""
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        logger.info("User %s logged out.", request.user.id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """
    GET /api/v1/auth/me/

    Return the currently authenticated user's profile.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: UserSerializer}, summary="Get current user profile")
    def get(self, request, *args, **kwargs):
        """Return the logged-in user's data."""
        return Response(UserSerializer(request.user).data)


class PasswordResetRequestView(APIView):
    """
    POST /api/v1/auth/password-reset/

    Request a password-reset email.
    Always returns 200 regardless of whether the email is registered
    (prevents user enumeration).
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=PasswordResetRequestSerializer,
        responses={200: OpenApiResponse(description="Reset email sent if account exists.")},
        summary="Request a password reset email",
    )
    def post(self, request, *args, **kwargs):
        """Initiate password reset flow."""
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.request_password_reset(email=serializer.validated_data["email"])
        return Response(
            {"detail": "If an account with that email exists, a reset link has been sent."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """
    POST /api/v1/auth/password-reset/confirm/

    Confirm a password reset using the token received via email.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=PasswordResetConfirmSerializer,
        responses={200: OpenApiResponse(description="Password reset successful.")},
        summary="Confirm password reset with token",
    )
    def post(self, request, *args, **kwargs):
        """Validate token and set new password."""
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.confirm_password_reset(
            token_obj=serializer.validated_data["token_obj"],
            new_password=serializer.validated_data["password"],
        )
        return Response(
            {"detail": "Password has been reset successfully."}, status=status.HTTP_200_OK
        )


class EmailVerifyView(APIView):
    """
    POST /api/v1/auth/verify-email/

    Verify a user's email address using the token sent to their inbox.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        request=EmailVerifySerializer,
        responses={200: OpenApiResponse(description="Email verified successfully.")},
        summary="Verify email address",
    )
    def post(self, request, *args, **kwargs):
        """Validate verification token and mark email as verified."""
        serializer = EmailVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            services.verify_email(token_str=serializer.validated_data["token"])
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"detail": "Email verified successfully."}, status=status.HTTP_200_OK
        )
