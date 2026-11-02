# StartPilot Backend

AI-powered startup incubation and venture validation platform.  
Django REST API that powers the StartPilot frontend (Next.js).

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Quick Start (Docker)](#quick-start-docker)
6. [Local Development (without Docker)](#local-development-without-docker)
7. [Environment Variables](#environment-variables)
8. [Database Setup](#database-setup)
9. [Seed Data](#seed-data)
10. [Running Tests](#running-tests)
11. [API Reference](#api-reference)
12. [Background Tasks (Celery)](#background-tasks-celery)
13. [Code Quality](#code-quality)
14. [Deployment](#deployment)

---

## Architecture Overview

StartPilot uses a **modular monolith** — a single Django project split into
focused apps, each with a single responsibility. All business logic lives in
`services.py` files; views are thin HTTP adapters.

```
Client (Next.js)
       │
       ▼
 Django REST API  (/api/v1/...)
       │
       ├── accounts      → Auth, JWT, Google OAuth, password reset
       ├── profiles      → StartupProfile, onboarding
       ├── ai            → Provider abstraction, Gemini, prompt templates
       ├── validation    → ValidationReport generation & storage
       ├── roadmaps      → Roadmap / Category / Task
       ├── chat          → AI Copilot conversation
       ├── notifications → In-app + email notifications
       └── core          → BaseModel, pagination, exceptions, health check
       │
       ├── PostgreSQL    → primary data store
       ├── Redis         → Celery broker + response cache
       └── Celery Worker → AI generation tasks, email dispatch
```

---

## Tech Stack

| Component        | Technology                              |
|------------------|-----------------------------------------|
| Framework        | Django 5.0 + Django REST Framework 3.15 |
| Database         | PostgreSQL 16                           |
| Cache / Broker   | Redis 7                                 |
| Async Tasks      | Celery 5.3                              |
| AI Provider      | Google Gemini (`google-generativeai`)   |
| Auth             | SimpleJWT + Google OAuth 2.0            |
| API Docs         | drf-spectacular (OpenAPI 3.0)           |
| Testing          | pytest + pytest-django + factory-boy    |
| Containerisation | Docker + Docker Compose                 |

---

## Project Structure

```
backend/
├── apps/
│   ├── accounts/          # User model, auth, JWT, Google OAuth
│   ├── ai/                # Provider abstraction, Gemini, prompt templates
│   │   ├── providers/
│   │   │   ├── base.py    # Abstract BaseAIProvider interface
│   │   │   └── gemini.py  # Gemini implementation
│   │   └── management/commands/seed_prompt_templates.py
│   ├── chat/              # Conversation, Message, Copilot service
│   ├── core/              # BaseModel, pagination, permissions, exceptions
│   ├── notifications/     # Notification model, email service, Celery tasks
│   ├── profiles/          # StartupProfile, onboarding, generation trigger
│   ├── roadmaps/          # Roadmap, RoadmapCategory, RoadmapTask
│   └── validation/        # ValidationReport, generation service
├── config/
│   ├── settings/
│   │   ├── base.py        # Common settings
│   │   ├── local.py       # Development overrides
│   │   └── production.py  # Production hardening
│   ├── celery.py
│   ├── urls.py
│   └── wsgi.py
├── templates/
│   └── emails/            # Plain-text email templates
├── conftest.py            # Pytest root configuration
├── manage.py
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── requirements.txt
├── pytest.ini
└── .env.example
```

---

## Prerequisites

- **Docker Desktop** 24+ and **Docker Compose** 2.0+ (recommended path)
- OR: Python 3.12+, PostgreSQL 16, Redis 7 (local dev path)
- A **Google Cloud** project with OAuth 2.0 credentials
- A **Google AI Studio** API key for Gemini

---

## Quick Start (Docker)

This is the recommended way to run the full stack including PostgreSQL, Redis,
Celery worker, and Nginx in one command.

### 1. Clone and configure

```bash
git clone <repo-url>
cd backend
cp .env.example .env
```

Edit `.env` and fill in your secrets (see [Environment Variables](#environment-variables)).

### 2. Build and start all services

```bash
docker compose up --build
```

The first start runs `migrate` and `collectstatic` automatically.

### 3. Seed prompt templates

```bash
docker compose exec backend python manage.py seed_prompt_templates
```

### 4. Create a superuser (optional)

```bash
docker compose exec backend python manage.py createsuperuser
```

### 5. Access the services

| Service          | URL                              |
|------------------|----------------------------------|
| API              | http://localhost/api/v1/         |
| Django Admin     | http://localhost/admin/          |
| Swagger UI       | http://localhost/api/docs/       |
| ReDoc            | http://localhost/api/redoc/      |
| Health Check     | http://localhost/api/v1/health/  |

---

## Local Development (without Docker)

### 1. Create a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Start PostgreSQL and Redis

```bash
# PostgreSQL (macOS with Homebrew)
brew services start postgresql@16

# Redis
brew services start redis
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL and REDIS_URL to point to local services
```

### 4. Run migrations and seed

```bash
export DJANGO_SETTINGS_MODULE=config.settings.local
python manage.py migrate
python manage.py seed_prompt_templates
```

### 5. Start the development server

```bash
python manage.py runserver
```

### 6. Start the Celery worker (separate terminal)

```bash
celery -A config worker --loglevel=info
```

---

## Environment Variables

Copy `.env.example` to `.env` and set each value:

| Variable              | Description                                          | Required |
|-----------------------|------------------------------------------------------|----------|
| `DJANGO_SECRET_KEY`   | Django secret key (generate a long random string)    | Yes      |
| `DEBUG`               | `True` for development, `False` for production       | Yes      |
| `ALLOWED_HOSTS`       | Comma-separated list of allowed hostnames            | Yes      |
| `DATABASE_URL`        | PostgreSQL connection string                         | Yes      |
| `REDIS_URL`           | Redis connection string (broker + cache)             | Yes      |
| `GOOGLE_CLIENT_ID`    | Google OAuth 2.0 client ID                           | Yes      |
| `GOOGLE_CLIENT_SECRET`| Google OAuth 2.0 client secret                       | Yes      |
| `GEMINI_API_KEY`      | Google AI Studio API key for Gemini                  | Yes      |
| `AI_PROVIDER`         | AI provider to use — currently only `gemini`         | Yes      |
| `EMAIL_HOST`          | SMTP server hostname                                 | Yes      |
| `EMAIL_PORT`          | SMTP server port (typically 587)                     | Yes      |
| `EMAIL_HOST_USER`     | SMTP username                                        | Yes      |
| `EMAIL_HOST_PASSWORD` | SMTP password or app password                        | Yes      |
| `DEFAULT_FROM_EMAIL`  | From address for all emails                          | Yes      |
| `FRONTEND_URL`        | Next.js frontend URL for email links                 | Yes      |
| `SENTRY_DSN`          | Sentry error tracking DSN (leave blank to disable)   | No       |

### Generating a secret key

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Database Setup

Migrations are managed with Django's standard migration system.

```bash
# Create all tables
python manage.py migrate

# Create new migrations after model changes
python manage.py makemigrations

# Show migration status
python manage.py showmigrations
```

---

## Seed Data

### Prompt Templates (required)

The AI generation pipeline reads `PromptTemplate` records from the database.
Run this once after the first migration (and again when prompts are updated):

```bash
python manage.py seed_prompt_templates
```

This creates three active templates: `validation_report`, `roadmap`, `copilot`.  
You can also edit templates live via the Django Admin at `/admin/ai/prompttemplate/`
without redeploying.

---

## Running Tests

```bash
# Run all tests with coverage
pytest

# Run a specific app
pytest apps/accounts/

# Run a specific test file
pytest apps/accounts/tests/test_views.py

# Run with verbose output, no coverage
pytest -v --no-cov

# Run only fast (non-slow) tests
pytest -m "not slow"
```

The test suite uses:
- `pytest-django` with `--reuse-db` for faster subsequent runs.
- `factory_boy` for model fixtures.
- `unittest.mock` to patch the AI provider — no real Gemini calls are made.
- An in-memory cache backend (no Redis needed).
- `CELERY_TASK_ALWAYS_EAGER=True` so tasks run synchronously.

Coverage target: **≥ 80%** overall, **≥ 90%** for auth and AI generation paths.

---

## API Reference

Interactive documentation is auto-generated by drf-spectacular:

- **Swagger UI**: `/api/docs/`
- **ReDoc**: `/api/redoc/`
- **OpenAPI schema (JSON)**: `/api/schema/`

### Endpoint Summary

#### Authentication (`/api/v1/auth/`)

| Method | Path                        | Description                          | Auth |
|--------|-----------------------------|--------------------------------------|------|
| POST   | `/register/`                | Register with email + password       | No   |
| POST   | `/login/`                   | Email/password → JWT tokens          | No   |
| POST   | `/google/`                  | Google OAuth code → JWT tokens       | No   |
| POST   | `/logout/`                  | Blacklist refresh token              | Yes  |
| GET    | `/me/`                      | Current user profile                 | Yes  |
| POST   | `/token/refresh/`           | Refresh access token                 | No   |
| POST   | `/password-reset/`          | Request reset email                  | No   |
| POST   | `/password-reset/confirm/`  | Confirm reset with token             | No   |
| POST   | `/verify-email/`            | Verify email with token              | No   |

#### Profile (`/api/v1/profile/`)

| Method | Path                    | Description                          | Auth |
|--------|-------------------------|--------------------------------------|------|
| GET    | `/`                     | Retrieve startup profile             | Yes  |
| PUT    | `/`                     | Full profile update                  | Yes  |
| PATCH  | `/`                     | Partial profile update               | Yes  |
| POST   | `/complete-onboarding/` | Trigger AI generation                | Yes  |
| GET    | `/status/`              | Poll generation status               | Yes  |

#### Validation Report (`/api/v1/validation-report/`)

| Method | Path | Description                          | Auth |
|--------|------|--------------------------------------|------|
| GET    | `/`  | Retrieve AI-generated report         | Yes  |

#### Roadmap (`/api/v1/roadmap/`)

| Method | Path              | Description                          | Auth |
|--------|-------------------|--------------------------------------|------|
| GET    | `/`               | Full roadmap with categories + tasks | Yes  |
| PATCH  | `/tasks/{id}/`    | Update task completion / notes       | Yes  |

#### Chat (`/api/v1/chat/`)

| Method | Path               | Description                          | Auth |
|--------|--------------------|--------------------------------------|------|
| GET    | `/conversations/`  | List user conversations              | Yes  |
| POST   | `/messages/`       | Send message to AI Copilot           | Yes  |
| GET    | `/messages/history/` | List message history               | Yes  |

#### Notifications (`/api/v1/notifications/`)

| Method | Path          | Description                          | Auth |
|--------|---------------|--------------------------------------|------|
| GET    | `/`           | List in-app notifications            | Yes  |
| PATCH  | `/{id}/read/` | Mark notification as read            | Yes  |

#### Core

| Method | Path              | Description                   | Auth |
|--------|-------------------|-------------------------------|------|
| GET    | `/api/v1/health/` | Health check (DB + Redis)     | No   |
| GET    | `/metrics`        | Prometheus metrics            | No   |

### Authentication Header

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

### Rate Limits

| Client type              | Limit        |
|--------------------------|--------------|
| Anonymous                | 100 / hour   |
| Authenticated            | 200 / hour   |
| AI endpoints (chat)      | 20 / hour    |

---

## Background Tasks (Celery)

All AI generation and email sending happens asynchronously via Celery.

### Task Overview

| Task name                                    | Trigger                            |
|----------------------------------------------|------------------------------------|
| `profiles.generate_startup_report_and_roadmap` | After onboarding completes       |
| `notifications.send_welcome_email`           | After user registration            |
| `notifications.send_verification_email`      | After onboarding completes         |
| `notifications.send_password_reset_email`    | On password reset request          |
| `notifications.send_report_ready_email`      | After report generation succeeds   |
| `notifications.send_roadmap_ready_email`     | After roadmap generation succeeds  |

### Generation Pipeline

```
POST /profile/complete-onboarding/
         │
         ▼
  generation_status = "pending"
         │
         ▼
  Celery task queued
         │
         ▼
  generation_status = "processing"
         │
    ┌────┴────┐
    ▼         ▼
  Generate  Generate
  Report    (uses report)
    │         │
    └────┬────┘
         ▼
  generation_status = "completed"
         │
         ▼
  Notify user (email + in-app)
```

Retry policy: up to 3 retries with exponential back-off (60s → 300s → 900s).  
On permanent failure: `generation_status = "failed"` with error stored.

### Frontend Polling

The frontend polls `GET /api/v1/profile/status/` every 5–10 seconds until
`generation_status` is `"completed"` or `"failed"`.

---

## Code Quality

```bash
# Format code
black .

# Sort imports
isort .

# Lint
flake8 .
```

All three tools are configured in `setup.cfg` and `pyproject.toml`.

---

## Deployment

### Production Docker Compose

Use the production settings module:

```bash
DJANGO_SETTINGS_MODULE=config.settings.production docker compose up -d
```

### Key production settings (`config/settings/production.py`)

- `DEBUG = False`
- `SECURE_SSL_REDIRECT = True`
- `SECURE_HSTS_SECONDS = 31536000`
- `SESSION_COOKIE_SECURE = True`
- Sentry integration active when `SENTRY_DSN` is set
- CORS restricted to `FRONTEND_URL` only

### Adding a new AI provider

1. Create `apps/ai/providers/your_provider.py` implementing `BaseAIProvider`.
2. Register it in `apps/ai/services._PROVIDER_REGISTRY`.
3. Set `AI_PROVIDER=your_provider` in `.env`.
4. No other code changes needed.

### Updating prompt templates

Edit templates live via Django Admin at `/admin/ai/prompttemplate/`  
or re-run `python manage.py seed_prompt_templates` after updating the seed command.  
No deployment required.

---

## Logs

- **Console**: all services log to stdout/stderr (Docker captures these).
- **File**: `logs/startpilot.log` (warnings and above in production).
- **Sentry**: errors and exceptions when `SENTRY_DSN` is configured.

---

## Contributing

1. Branch from `main`: `git checkout -b feature/your-feature`
2. Keep views thin — business logic belongs in `services.py`.
3. Write tests for new functionality (maintain ≥ 80% coverage).
4. Run `black . && isort . && flake8 .` before committing.
5. Open a pull request with a clear description of the change.
