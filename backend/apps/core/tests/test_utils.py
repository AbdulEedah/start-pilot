"""Tests for core utilities."""
import pytest
from unittest.mock import patch

from apps.core.utils import build_frontend_url, generate_secure_token, mask_email, token_expiry


class TestGenerateSecureToken:
    """Tests for generate_secure_token."""

    def test_returns_non_empty_string(self):
        token = generate_secure_token()
        assert isinstance(token, str)
        assert len(token) > 20

    def test_each_call_returns_unique_value(self):
        tokens = {generate_secure_token() for _ in range(10)}
        assert len(tokens) == 10

    def test_respects_nbytes_parameter(self):
        short = generate_secure_token(nbytes=8)
        long = generate_secure_token(nbytes=64)
        assert len(long) > len(short)


class TestTokenExpiry:
    """Tests for token_expiry."""

    def test_returns_future_datetime(self):
        from django.utils import timezone
        expiry = token_expiry(hours=1)
        assert expiry > timezone.now()

    def test_default_is_24_hours(self):
        from django.utils import timezone
        from datetime import timedelta
        expiry = token_expiry()
        expected = timezone.now() + timedelta(hours=24)
        diff = abs((expiry - expected).total_seconds())
        assert diff < 5  # within 5 seconds


class TestMaskEmail:
    """Tests for mask_email."""

    def test_masks_local_part(self):
        masked = mask_email("john.doe@example.com")
        assert "***" in masked
        assert "@example.com" in masked
        assert "john.doe" not in masked

    def test_preserves_domain(self):
        masked = mask_email("a@b.com")
        assert "@b.com" in masked


class TestBuildFrontendUrl:
    """Tests for build_frontend_url."""

    @patch("django.conf.settings.FRONTEND_URL", "http://localhost:3000")
    def test_builds_correct_url(self):
        url = build_frontend_url("/verify-email/abc123")
        assert url == "http://localhost:3000/verify-email/abc123"

    @patch("django.conf.settings.FRONTEND_URL", "http://localhost:3000/")
    def test_handles_trailing_slash_in_base(self):
        url = build_frontend_url("/reset-password/xyz")
        # Should not double-slash
        assert "//reset" not in url
        assert url.startswith("http://localhost:3000")
