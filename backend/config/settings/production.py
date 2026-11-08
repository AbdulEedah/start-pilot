"""
Production settings for StartPilot.
Extends base settings with production-specific hardening and performance tuning.
"""
import os
import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.redis import RedisIntegration

from .base import *  # noqa: F401, F403
from .base import SENTRY_DSN, config

DEBUG = config("DEBUG", default=False, cast=bool)

# ─────────────────────────────────────────────────────────────────────────────
# Allowed Hosts & Render Support
# ─────────────────────────────────────────────────────────────────────────────
RENDER_EXTERNAL_HOSTNAME = config("RENDER_EXTERNAL_HOSTNAME", default=None)
if RENDER_EXTERNAL_HOSTNAME and RENDER_EXTERNAL_HOSTNAME not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Ensure common cloud & development hostnames are allowed
for host in [".onrender.com", "localhost", "127.0.0.1"]:
    if host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(host)

# ─────────────────────────────────────────────────────────────────────────────
# CORS & CSRF Configuration
# ─────────────────────────────────────────────────────────────────────────────
raw_frontend_url = config("FRONTEND_URL", default="https://startpilot.io")
frontend_origins = [url.strip() for url in raw_frontend_url.split(",") if url.strip()]

raw_cors_origins = config("CORS_ALLOWED_ORIGINS", default="")
extra_cors_origins = [url.strip() for url in raw_cors_origins.split(",") if url.strip()]

CORS_ALLOWED_ORIGINS = list(dict.fromkeys(frontend_origins + extra_cors_origins))

# Allow Vercel preview and production deployments
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https:\/\/.*\.vercel\.app$",
]

# CSRF Trusted Origins for modern Django (required for cross-origin HTTPS POST)
CSRF_TRUSTED_ORIGINS = [
    "https://*.onrender.com",
    "https://*.vercel.app",
]
for origin in CORS_ALLOWED_ORIGINS:
    if origin.startswith("http://") or origin.startswith("https://"):
        if origin not in CSRF_TRUSTED_ORIGINS:
            CSRF_TRUSTED_ORIGINS.append(origin)

if RENDER_EXTERNAL_HOSTNAME:
    render_origin = f"https://{RENDER_EXTERNAL_HOSTNAME}"
    if render_origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(render_origin)

# ─────────────────────────────────────────────────────────────────────────────
# HTTPS enforcement
# ─────────────────────────────────────────────────────────────────────────────
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# ─────────────────────────────────────────────────────────────────────────────
# Static files – served via WhiteNoise in production
# ─────────────────────────────────────────────────────────────────────────────
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
WHITENOISE_MANIFEST_STRICT = False

# ─────────────────────────────────────────────────────────────────────────────
# Cache & Celery (Graceful fallback if Redis is not provisioned)
# ─────────────────────────────────────────────────────────────────────────────
REDIS_URL = config("REDIS_URL", default=None)
if not REDIS_URL or REDIS_URL.strip() == "":
    # Fallback to in-memory cache and eager Celery tasks when Redis is not available
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        }
    }
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = False

# ─────────────────────────────────────────────────────────────────────────────
# Logging (stream everything to console for Render)
# ─────────────────────────────────────────────────────────────────────────────
LOGGING["handlers"]["file"] = {
    "level": "INFO",
    "class": "logging.StreamHandler",
    "formatter": "verbose",
}

# ─────────────────────────────────────────────────────────────────────────────
# Sentry error tracking
# ─────────────────────────────────────────────────────────────────────────────
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(transaction_style="url"),
            CeleryIntegration(),
            RedisIntegration(),
        ],
        traces_sample_rate=0.1,
        send_default_pii=False,
    )
