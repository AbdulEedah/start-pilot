"""
Shared utility functions for StartPilot.
"""
import hashlib
import secrets
from datetime import timedelta
from typing import Optional

from django.utils import timezone


def generate_secure_token(nbytes: int = 32) -> str:
    """
    Generate a URL-safe, cryptographically strong random token.

    Args:
        nbytes: Number of random bytes (default 32 → 43-char base64 string).

    Returns:
        URL-safe base64-encoded token string.
    """
    return secrets.token_urlsafe(nbytes)


def token_expiry(hours: int = 24):
    """
    Return a timezone-aware datetime ``hours`` from now.

    Args:
        hours: Number of hours until expiry (default 24).

    Returns:
        Timezone-aware datetime object.
    """
    return timezone.now() + timedelta(hours=hours)


def hash_token(token: str) -> str:
    """
    Return a SHA-256 hex digest of the given token.
    Used to store tokens securely without plaintext.
    """
    return hashlib.sha256(token.encode()).hexdigest()


def mask_email(email: str) -> str:
    """
    Partially obscure an email address for logging.
    Example: 'john.doe@example.com' → 'jo***@example.com'
    """
    local, domain = email.split("@", 1)
    masked_local = local[:2] + "***" if len(local) > 2 else "***"
    return f"{masked_local}@{domain}"


def build_frontend_url(path: str) -> str:
    """
    Build a full URL pointing to the Next.js frontend.

    Args:
        path: Relative path, e.g. '/verify-email/abc123'.

    Returns:
        Absolute URL string.
    """
    from django.conf import settings

    base = settings.FRONTEND_URL.rstrip("/")
    path = path.lstrip("/")
    return f"{base}/{path}"
