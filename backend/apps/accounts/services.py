"""
Business-logic services for the accounts app.

Services:
    register_user            – Create user and dispatch welcome email.
    login_user               – Authenticate and return JWT tokens.
    google_oauth_login       – Exchange Google auth code, find or create user, return JWT.
    request_password_reset   – Generate reset token and dispatch email.
    confirm_password_reset   – Validate token and update password.
    verify_email             – Validate token and mark email as verified.
"""
import logging

import requests
from django.conf import settings
from django.db import transaction
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.utils import mask_email

from .models import EmailVerificationToken, PasswordResetToken, User

logger = logging.getLogger(__name__)


def _get_tokens_for_user(user: User) -> dict:
    """Generate JWT access and refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


@transaction.atomic
def register_user(email: str, password: str, full_name: str) -> User:
    """
    Create a new user account and trigger a welcome email via Celery.

    Args:
        email:     User's email address (already validated and normalised).
        password:  Plaintext password (will be hashed by create_user).
        full_name: User's display name.

    Returns:
        Newly created User instance.
    """
    user = User.objects.create_user(email=email, password=password, full_name=full_name)
    logger.info("New user registered: %s", mask_email(email))

    # Dispatch welcome email asynchronously – import here to avoid circular deps
    from apps.notifications.tasks import send_welcome_email_task

    send_welcome_email_task.delay(user.id)
    return user


def google_oauth_login(code: str) -> dict:
    """
    Exchange a Google OAuth authorisation code for user info, then find or
    create a matching User and return JWT tokens.

    Args:
        code: Google OAuth2 authorisation code from the frontend.

    Returns:
        Dict with 'user' data, 'access', and 'refresh' tokens.

    Raises:
        ValueError: If token exchange or verification fails.
    """
    # Exchange code for tokens via Google token endpoint
    token_response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": "postmessage",  # Used for frontend popup flows
            "grant_type": "authorization_code",
        },
        timeout=10,
    )

    if not token_response.ok:
        logger.error("Google token exchange failed: %s", token_response.text)
        raise ValueError("Failed to exchange Google authorisation code.")

    token_data = token_response.json()
    id_token_str = token_data.get("id_token")
    if not id_token_str:
        raise ValueError("Google response did not include an ID token.")

    # Verify the ID token and extract user info
    try:
        user_info = id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except Exception as exc:
        logger.error("Google ID token verification failed: %s", exc)
        raise ValueError("Google token verification failed.") from exc

    google_id = user_info.get("sub")
    email = user_info.get("email", "").lower()
    full_name = user_info.get("name", "")
    avatar = user_info.get("picture", "")

    if not email or not google_id:
        raise ValueError("Insufficient user info returned from Google.")

    user = _find_or_create_google_user(
        google_id=google_id,
        email=email,
        full_name=full_name,
        avatar=avatar,
    )

    from apps.accounts.serializers import UserSerializer

    tokens = _get_tokens_for_user(user)
    tokens["user"] = UserSerializer(user).data
    return tokens


@transaction.atomic
def _find_or_create_google_user(
    google_id: str, email: str, full_name: str, avatar: str
) -> User:
    """
    Find an existing user by google_id or email, or create a new one.
    Updates google_id and avatar if the user exists but is not yet linked.
    """
    # Try to find by Google ID first (most specific match)
    user = User.objects.filter(google_id=google_id).first()
    if user:
        return user

    # Fall back to email lookup (user may have registered before connecting Google)
    user = User.objects.filter(email=email).first()
    if user:
        # Link the Google account to the existing user
        user.google_id = google_id
        if not user.avatar and avatar:
            user.avatar = avatar
        user.is_email_verified = True
        user.save(update_fields=["google_id", "avatar", "is_email_verified"])
        return user

    # Brand-new user via Google
    user = User.objects.create_user(
        email=email,
        full_name=full_name,
        avatar=avatar,
        google_id=google_id,
        is_email_verified=True,  # Email is verified by Google
    )
    logger.info("New user created via Google OAuth: %s", mask_email(email))

    from apps.notifications.tasks import send_welcome_email_task

    send_welcome_email_task.delay(user.id)
    return user


@transaction.atomic
def request_password_reset(email: str) -> None:
    """
    Generate a password-reset token and send a reset email.
    If no user exists with this email, silently succeeds to prevent enumeration.

    Args:
        email: Normalised email address of the account to reset.
    """
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Silently return – don't reveal whether the email is registered
        logger.info("Password reset requested for unknown email: %s", mask_email(email))
        return

    # Invalidate any existing unused tokens
    PasswordResetToken.objects.filter(user=user, is_used=False).delete()

    token = PasswordResetToken.objects.create(user=user)
    logger.info("Password reset token created for user %s", user.id)

    from apps.notifications.tasks import send_password_reset_email_task

    send_password_reset_email_task.delay(user.id, token.token)


@transaction.atomic
def confirm_password_reset(token_obj: PasswordResetToken, new_password: str) -> None:
    """
    Set the new password and mark the reset token as used.

    Args:
        token_obj:    Validated PasswordResetToken instance.
        new_password: New plaintext password (already validated).
    """
    user = token_obj.user
    user.set_password(new_password)
    user.save(update_fields=["password"])

    token_obj.is_used = True
    token_obj.save(update_fields=["is_used"])
    logger.info("Password reset completed for user %s", user.id)


@transaction.atomic
def verify_email(token_str: str) -> User:
    """
    Mark the user's email as verified and delete the verification token.

    Args:
        token_str: Raw verification token string.

    Returns:
        The verified User instance.

    Raises:
        ValueError: If the token is invalid or expired.
    """
    try:
        token_obj = EmailVerificationToken.objects.select_related("user").get(token=token_str)
    except EmailVerificationToken.DoesNotExist:
        raise ValueError("Invalid or expired verification token.")

    if token_obj.is_expired:
        token_obj.delete()
        raise ValueError("Invalid or expired verification token.")

    user = token_obj.user
    user.is_email_verified = True
    user.save(update_fields=["is_email_verified"])

    token_obj.delete()
    logger.info("Email verified for user %s", user.id)
    return user


def create_email_verification_token(user: User) -> EmailVerificationToken:
    """
    Create (or replace) an email verification token for the given user.

    Args:
        user: User instance that needs email verification.

    Returns:
        Newly created EmailVerificationToken.
    """
    # Remove any existing tokens before creating a fresh one
    EmailVerificationToken.objects.filter(user=user).delete()
    return EmailVerificationToken.objects.create(user=user)
