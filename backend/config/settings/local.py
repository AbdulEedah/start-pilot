"""
Local (development) settings for StartPilot.
Extends base settings with development-specific configuration.
"""
from .base import *  # noqa: F401, F403

DEBUG = True

# Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# SQLite busy timeout to prevent database locks in local development
if "sqlite" in DATABASES["default"].get("ENGINE", ""):
    DATABASES["default"].setdefault("OPTIONS", {})["timeout"] = 30

# Use console email backend in development for easy debugging
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Disable rate limiting in development for convenience
REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"] = []  # noqa: F405

# Simplified password validation for local development
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
]

# Django Debug Toolbar (optional – install separately if needed)
INTERNAL_IPS = ["127.0.0.1"]

# In-memory cache for local development without Redis
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

# Run Celery tasks synchronously in local development so Redis isn't strictly required
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = False

# Simplified logging for local development
LOGGING["handlers"]["console"]["level"] = "DEBUG"  # noqa: F405
LOGGING["loggers"]["apps"]["level"] = "DEBUG"  # noqa: F405
