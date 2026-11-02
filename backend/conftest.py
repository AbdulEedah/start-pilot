"""
Root pytest conftest for StartPilot backend.

Configures Django settings, provides shared fixtures used across all test modules,
and sets up common mocking so tests run without real AI API calls or Redis.
"""
import django
import pytest
from django.conf import settings


# ─────────────────────────────────────────────────────────────────────────────
# Shared fixtures
# ─────────────────────────────────────────────────────────────────────────────


@pytest.fixture(autouse=True)
def reset_ai_provider_cache():
    """
    Reset the AIProviderFactory singleton before every test so provider
    configuration changes in one test don't bleed into the next.
    """
    from apps.ai.services import AIProviderFactory
    AIProviderFactory.reset()
    yield
    AIProviderFactory.reset()


@pytest.fixture(autouse=True)
def use_dummy_cache(settings):
    """
    Replace Redis cache with the in-memory dummy backend for all tests.
    Prevents tests from requiring a running Redis instance.
    """
    from django.core.cache import cache
    settings.CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        }
    }
    cache.clear()
    yield
    cache.clear()


@pytest.fixture(autouse=True)
def use_console_email_backend(settings):
    """Use the in-memory email backend so emails don't actually send in tests."""
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"


@pytest.fixture(autouse=True)
def celery_always_eager(settings):
    """
    Run Celery tasks synchronously and in-process during tests.
    This means task.delay() executes immediately without a worker.
    """
    settings.CELERY_TASK_ALWAYS_EAGER = True
    settings.CELERY_TASK_EAGER_PROPAGATES = True
