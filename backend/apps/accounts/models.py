"""
Accounts models for StartPilot.

Models:
    User                  – Custom user extending AbstractUser.
    EmailVerificationToken – Short-lived token for email address confirmation.
    PasswordResetToken    – Short-lived token for password reset flow.
"""
import logging
import os

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

from apps.core.utils import generate_secure_token, token_expiry

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# User manager
# ─────────────────────────────────────────────────────────────────────────────


class UserManager(BaseUserManager):
    """
    Custom manager for the StartPilot User model.
    Uses email as the unique identifier instead of username.
    """

    def create_user(self, email: str, password: str = None, **extra_fields):
        """Create and return a regular user with an email and password."""
        if not email:
            raise ValueError("Email address is required.")
        email = self.normalize_email(email).lower()
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_email_verified", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


def avatar_upload_path(instance, filename):
    """Construct the upload path for user avatar images."""
    ext = os.path.splitext(filename)[1].lower()
    return f"avatars/{instance.pk}{ext}"


# ─────────────────────────────────────────────────────────────────────────────
# User
# ─────────────────────────────────────────────────────────────────────────────


class User(AbstractUser):
    """
    Custom user model for StartPilot.

    Replaces Django's default username-based auth with email-based auth.
    Extends AbstractUser to keep all built-in permission and group machinery.
    """

    # Remove username – email is the login identifier
    username = None

    email = models.EmailField(
        unique=True,
        db_index=True,
        verbose_name="email address",
        help_text="Required. Used as the login identifier.",
    )
    full_name = models.CharField(
        max_length=255,
        verbose_name="full name",
        help_text="User's full display name.",
    )
    google_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True,
        verbose_name="Google ID",
        help_text="Google OAuth user identifier for linked accounts.",
    )
    avatar = models.URLField(
        blank=True,
        verbose_name="avatar URL",
        help_text="URL of the user's profile picture (from Google or uploaded).",
    )
    is_email_verified = models.BooleanField(
        default=False,
        verbose_name="email verified",
        help_text="Indicates whether the user has verified their email address.",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    class Meta:
        db_table = "users"
        verbose_name = "user"
        verbose_name_plural = "users"
        ordering = ["-date_joined"]

    def __str__(self) -> str:
        return f"{self.full_name} <{self.email}>"

    @property
    def first_name_display(self) -> str:
        """Return the first word of the full_name as a display first name."""
        return self.full_name.split()[0] if self.full_name else ""


# ─────────────────────────────────────────────────────────────────────────────
# Email Verification Token
# ─────────────────────────────────────────────────────────────────────────────


class EmailVerificationToken(models.Model):
    """
    Short-lived token used to verify a user's email address.
    Generated after registration; expires after 24 hours.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="email_verification_tokens",
        verbose_name="user",
    )
    token = models.CharField(
        max_length=128,
        unique=True,
        db_index=True,
        verbose_name="token",
        help_text="URL-safe random token for email verification.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(
        verbose_name="expires at",
        help_text="Token is invalid after this datetime.",
    )

    class Meta:
        db_table = "email_verification_tokens"
        verbose_name = "email verification token"
        verbose_name_plural = "email verification tokens"

    def __str__(self) -> str:
        return f"EmailVerificationToken(user={self.user.email})"

    def save(self, *args, **kwargs):
        """Auto-generate token and expiry if not set."""
        if not self.token:
            self.token = generate_secure_token()
        if not self.expires_at:
            self.expires_at = token_expiry(hours=24)
        super().save(*args, **kwargs)

    @property
    def is_expired(self) -> bool:
        """Return True if this token is past its expiry datetime."""
        from django.utils import timezone

        return timezone.now() > self.expires_at


# ─────────────────────────────────────────────────────────────────────────────
# Password Reset Token
# ─────────────────────────────────────────────────────────────────────────────


class PasswordResetToken(models.Model):
    """
    Short-lived token used to reset a user's password.
    Generated on demand; expires after 1 hour.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="password_reset_tokens",
        verbose_name="user",
    )
    token = models.CharField(
        max_length=128,
        unique=True,
        db_index=True,
        verbose_name="token",
        help_text="URL-safe random token for password reset.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(
        verbose_name="expires at",
        help_text="Token is invalid after this datetime.",
    )
    is_used = models.BooleanField(
        default=False,
        help_text="True once the token has been consumed for a password reset.",
    )

    class Meta:
        db_table = "password_reset_tokens"
        verbose_name = "password reset token"
        verbose_name_plural = "password reset tokens"

    def __str__(self) -> str:
        return f"PasswordResetToken(user={self.user.email})"

    def save(self, *args, **kwargs):
        """Auto-generate token and expiry if not set."""
        if not self.token:
            self.token = generate_secure_token()
        if not self.expires_at:
            self.expires_at = token_expiry(hours=1)
        super().save(*args, **kwargs)

    @property
    def is_expired(self) -> bool:
        """Return True if this token is past its expiry datetime."""
        from django.utils import timezone

        return timezone.now() > self.expires_at

    @property
    def is_valid(self) -> bool:
        """Return True if the token has not been used and has not expired."""
        return not self.is_used and not self.is_expired
