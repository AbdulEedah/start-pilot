"""
Serializers for the accounts app.

Covers registration, login, Google OAuth, password reset, and user profile.
"""
import logging

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import PasswordResetToken, User

logger = logging.getLogger(__name__)


class UserSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for the authenticated user's public profile.
    Returned by GET /api/v1/auth/me/.
    """

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "avatar",
            "is_email_verified",
            "date_joined",
        ]
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for new user registration.
    Validates password strength, uniqueness of email, and creates the user.
    """

    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    password_confirm = serializers.CharField(
        write_only=True, style={"input_type": "password"}, label="Confirm password"
    )

    class Meta:
        model = User
        fields = ["email", "full_name", "password", "password_confirm"]

    def validate_email(self, value: str) -> str:
        """Ensure email is not already registered."""
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_password(self, value: str) -> str:
        """Run Django's built-in password validators."""
        validate_password(value)
        return value

    def validate(self, attrs: dict) -> dict:
        """Ensure password and confirmation match."""
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data: dict) -> User:
        """Create the user using the custom manager so password is hashed."""
        return User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["full_name"],
        )


class LoginSerializer(serializers.Serializer):
    """
    Serializer for email/password login.
    Returns JWT access and refresh tokens on success.
    """

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs: dict) -> dict:
        """Authenticate credentials and attach tokens."""
        email = attrs["email"].lower().strip()
        password = attrs["password"]

        user = authenticate(request=self.context.get("request"), email=email, password=password)
        if not user:
            raise serializers.ValidationError(
                {"detail": "Invalid email or password."}
            )
        if not user.is_active:
            raise serializers.ValidationError({"detail": "This account has been deactivated."})

        refresh = RefreshToken.for_user(user)
        return {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class GoogleOAuthSerializer(serializers.Serializer):
    """
    Serializer for Google OAuth flow.
    The frontend provides the Google authorisation code; we exchange it for user info.
    """

    code = serializers.CharField(help_text="Google OAuth2 authorisation code from the frontend.")


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for initiating a password reset.
    Accepts the user's email address.
    """

    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        """Normalise the email; existence is not disclosed to prevent user enumeration."""
        return value.lower().strip()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for completing a password reset.
    Validates the token and new password, then updates the user's password.
    """

    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8, style={"input_type": "password"})
    password_confirm = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate_password(self, value: str) -> str:
        """Run Django's built-in password validators."""
        validate_password(value)
        return value

    def validate(self, attrs: dict) -> dict:
        """Validate token existence, validity, and matching passwords."""
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})

        try:
            token_obj = PasswordResetToken.objects.select_related("user").get(
                token=attrs["token"]
            )
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({"token": "Invalid or expired token."})

        if not token_obj.is_valid:
            raise serializers.ValidationError({"token": "Invalid or expired token."})

        attrs["token_obj"] = token_obj
        return attrs


class EmailVerifySerializer(serializers.Serializer):
    """
    Serializer for email verification.
    Accepts the token sent to the user's email.
    """

    token = serializers.CharField(help_text="Email verification token received via email.")


class TokenRefreshResponseSerializer(serializers.Serializer):
    """Schema-only serializer documenting the token refresh response."""

    access = serializers.CharField()
    refresh = serializers.CharField()
