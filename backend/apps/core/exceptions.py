"""
Custom exception handler and application-level exceptions for StartPilot.
Ensures consistent error response format across all endpoints:

    {
        "detail": "Human-readable message",
        "field_errors": {"field": ["error"]}   # optional
    }

Internal details are never leaked to the client.
"""
import logging

from django.core.exceptions import PermissionDenied, ValidationError
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler.
    Normalises all exceptions into the standard error envelope.
    Logs unexpected errors (5xx) for monitoring.
    """
    # Let DRF handle known API exceptions first
    response = exception_handler(exc, context)

    if response is not None:
        # Reformat known DRF exceptions
        data = {}

        if isinstance(response.data, dict):
            # Separate non-field errors from field errors
            non_field = response.data.pop("non_field_errors", None) or response.data.pop(
                "detail", None
            )
            field_errors = {k: v for k, v in response.data.items() if k not in ("detail",)}

            if non_field:
                data["detail"] = (
                    non_field[0] if isinstance(non_field, list) else str(non_field)
                )
            elif response.status_code >= 500:
                data["detail"] = "An unexpected error occurred."
            else:
                data["detail"] = _status_to_message(response.status_code)

            if field_errors:
                data["field_errors"] = field_errors

        elif isinstance(response.data, list):
            data["detail"] = response.data[0] if response.data else "Unknown error."
        else:
            data["detail"] = str(response.data)

        response.data = data
        return response

    # Handle non-DRF exceptions
    if isinstance(exc, Http404):
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if isinstance(exc, PermissionDenied):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if isinstance(exc, ValidationError):
        return Response(
            {"detail": "Validation error.", "field_errors": exc.message_dict},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Unexpected exception – log it and return a generic 500
    logger.exception("Unhandled exception in view", exc_info=exc)
    return Response(
        {"detail": "An unexpected error occurred."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _status_to_message(status_code: int) -> str:
    """Return a human-readable default message for a given HTTP status code."""
    messages = {
        400: "Bad request.",
        401: "Authentication credentials were not provided or are invalid.",
        403: "You do not have permission to perform this action.",
        404: "Not found.",
        405: "Method not allowed.",
        409: "Conflict.",
        429: "Too many requests. Please slow down.",
        500: "An unexpected error occurred.",
        503: "Service temporarily unavailable.",
    }
    return messages.get(status_code, "An error occurred.")


# ─────────────────────────────────────────────────────────────────────────────
# Application-level exceptions
# ─────────────────────────────────────────────────────────────────────────────


class StartPilotException(APIException):
    """Base class for all StartPilot domain exceptions."""

    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "A StartPilot error occurred."
    default_code = "startpilot_error"


class AIGenerationError(StartPilotException):
    """Raised when the AI provider fails to generate content."""

    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = "AI content generation failed. Please try again later."
    default_code = "ai_generation_error"


class ProfileNotFoundError(StartPilotException):
    """Raised when the user does not have a startup profile."""

    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Startup profile not found."
    default_code = "profile_not_found"


class OnboardingNotCompleteError(StartPilotException):
    """Raised when an action requires completed onboarding."""

    default_detail = "Please complete onboarding before accessing this feature."
    default_code = "onboarding_not_complete"


class ReportNotReadyError(StartPilotException):
    """Raised when the validation report has not been generated yet."""

    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Validation report is not ready yet."
    default_code = "report_not_ready"
