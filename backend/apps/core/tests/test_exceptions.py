"""Tests for the custom exception handler."""
import pytest
from unittest.mock import MagicMock
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, NotFound, ValidationError

from apps.core.exceptions import custom_exception_handler


class TestCustomExceptionHandler:
    """Tests for custom_exception_handler."""

    def _make_context(self):
        return {"request": MagicMock(), "view": MagicMock()}

    def test_handles_not_found(self):
        exc = NotFound("Resource not found.")
        response = custom_exception_handler(exc, self._make_context())
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "detail" in response.data

    def test_handles_authentication_failed(self):
        exc = AuthenticationFailed("Invalid token.")
        response = custom_exception_handler(exc, self._make_context())
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_handles_validation_error_with_field_errors(self):
        exc = ValidationError({"email": ["This field is required."]})
        response = custom_exception_handler(exc, self._make_context())
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "field_errors" in response.data
        assert "email" in response.data["field_errors"]

    def test_returns_none_for_unknown_exception(self):
        """Unknown exceptions return None (Django's default 500 handler kicks in)."""
        exc = RuntimeError("Something broke")
        response = custom_exception_handler(exc, self._make_context())
        # Should return a 500 response for unhandled exceptions
        assert response is not None
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

    def test_response_has_detail_key(self):
        exc = NotFound()
        response = custom_exception_handler(exc, self._make_context())
        assert "detail" in response.data

    def test_no_stack_trace_in_response(self):
        exc = RuntimeError("Internal error")
        response = custom_exception_handler(exc, self._make_context())
        response_str = str(response.data)
        assert "Traceback" not in response_str
        assert "RuntimeError" not in response_str
