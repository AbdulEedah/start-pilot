"""
Local (development) settings for StartPilot.
Extends base settings with development-specific configuration.
"""
from .base import *  # noqa: F401, F403

DEBUG = True

# Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Use console email backend in development for easy debugging
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Disable rate limiting in development for convenience
REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"] = []  # noqa: F405

# Django Debug Toolbar (optional – install separately if needed)
INTERNAL_IPS = ["127.0.0.1"]

# Simplified logging for local development
LOGGING["handlers"]["console"]["level"] = "DEBUG"  # noqa: F405
LOGGING["loggers"]["apps"]["level"] = "DEBUG"  # noqa: F405
