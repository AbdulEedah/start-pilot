# StartPilot Backend Documentation

## Overview

StartPilot is an AI-powered startup incubation and venture validation platform that helps entrepreneurs validate their ideas, generate actionable roadmaps, and receive personalized guidance through conversational AI.

**Core Capabilities:**
- AI-driven startup validation reports
- Personalized development roadmaps
- Conversational AI copilot for real-time guidance
- Comprehensive user onboarding and profile management
- Asynchronous task processing with Celery

## Architecture & Technology Stack

### Core Framework
- **Django 5.0.6** - Web framework
- **Django REST Framework 3.15.2** - API construction
- **PostgreSQL 16** - Primary database
- **Redis 7** - Cache and Celery broker
- **Celery 5.3.6** - Async task processing

### AI Integration
- **Google Generative AI** - Primary AI provider (Gemini)
- **django-celery-beat** - Scheduled tasks
- **django-celery-results** - Task result storage

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Gunicorn** - WSGI server
- **Nginx** - Reverse proxy
- **Sentry** - Error monitoring
- **Prometheus** - Metrics collection

## Project Structure

```
backend/
├── apps/                    # Django applications
│   ├── accounts/           # Authentication & user management
│   ├── ai/                 # AI service layer and providers
│   ├── chat/               # Conversational AI interface
│   ├── core/               # Shared models, exceptions, utilities
│   ├── notifications/      # System notifications
│   ├── profiles/           # Startup profile management
│   ├── roadmaps/           # Development roadmap generation
│   └── validation/         # Startup validation reports
├── config/                 # Django configuration
│   └── settings/
│       ├── base.py         # Base settings
│       ├── local.py        # Development settings
│       └── production.py   # Production settings
└── manage.py              # Django CLI
```

## Core Components

### 1. Authentication System (`apps/accounts/`)

**Custom User Model:**
- Email-based authentication (no username)
- Full name, email verification status
- JWT token authentication with SimpleJWT
- Google OAuth integration

**Key Features:**
- Registration with email verification
- Password reset flow with secure tokens
- JWT token refresh mechanism
- Email notifications via django-anymail

**Security Measures:**
- Password hashing via Django's built-in auth
- Email verification before full access
- Secure token generation with expiration
- Rate limiting on sensitive endpoints

### 2. AI Service Layer (`apps/ai/`)

**AI Provider Factory Pattern:**
- Central registry for AI providers
- Swappable providers via configuration
- Currently supports Google Gemini
- Extensible for future providers (OpenAI, Anthropic, etc.)

**Prompt Template Management:**
- Database-stored prompt templates
- Versioned templates with few-shot examples
- Dynamic template loading at runtime
- Template placeholders for variable substitution

**Usage Tracking:**
- Comprehensive logging of AI API calls
- Token usage monitoring for cost tracking
- Performance metrics collection
- Error tracking and alerting

### 3. Startup Profile Management (`apps/profiles/`)

**StartupProfile Model:**
- One-to-one relationship with User
- Stores all startup-related data:
  - Sector (technology, climate, health, etc.)
  - Problem statement and background story
  - Location information (country, state, city)
  - Team composition and commitment level
  - Available resources and key skills

**Onboarding Flow:**
1. User registers and verifies email
2. User completes startup profile questionnaire
3. System marks onboarding as complete
4. AI generation processes are triggered

**Status Tracking:**
- Profile completion status
- AI generation status (idle, pending, processing, completed)
- Real-time progress updates via notifications

### 4. Validation Reports (`apps/validation/`)

**AI-Generated Analysis:**
- Comprehensive startup idea validation
- Market analysis and opportunity assessment
- Risk identification and mitigation strategies
- Competitive landscape overview

**Report Structure:**
- Executive summary
- Problem-solution fit analysis
- Market size and growth potential
- Competitive advantages
- Key risks and challenges
- Recommended next steps

**Generation Process:**
1. Profile data serialization
2. Prompt template selection
3. AI API call with profile context
4. Report parsing and structured storage
5. User notification on completion

### 5. Development Roadmaps (`apps/roadmaps/`)

**Personalized Action Plan:**
- Step-by-step development guide
- Timeline estimates and dependencies
- Resource requirements
- Success metrics and checkpoints

**Task Management:**
- Task status tracking (pending, in_progress, completed)
- Progress visualization
- Milestone achievement tracking
- Regular progress updates

**AI Integration:**
- Roadmap generation based on validation report
- Industry-specific best practices
- Adaptive planning based on team capabilities
- Continuous refinement based on progress

### 6. Conversational AI (`apps/chat/`)

**Context-Aware Conversations:**
- Startup profile context awareness
- Conversation history persistence
- Role-based message handling (user/assistant)
- Real-time response generation

**Features:**
- Message threading and organization
- Rate limiting for AI-heavy endpoints
- Conversation persistence across sessions
- Contextual guidance based on startup stage

**Technical Implementation:**
- Dedicated conversation per startup profile
- Message serialization with timestamps
- AI provider integration for response generation
- Usage throttling to manage API costs

### 7. Notification System (`apps/notifications/`)

**Event-Driven Notifications:**
- Profile completion alerts
- AI generation completion notices
- System updates and announcements
- Reminder notifications

**Delivery Channels:**
- In-app notifications
- Email notifications
- Real-time updates (via WebSocket future extension)

**Management:**
- Notification preferences
- Read/unread status tracking
- Bulk notification management
- Historical notification archive

## API Endpoints

### Authentication (`/api/v1/auth/`)
- `POST /register/` - Create new account
- `POST /login/` - Obtain JWT tokens
- `POST /google/` - Google OAuth authentication
- `POST /logout/` - Invalidate refresh token
- `GET /me/` - Get current user info
- `POST /token/refresh/` - Refresh access token
- `POST /password-reset/` - Request password reset
- `POST /password-reset/confirm/` - Confirm password reset
- `POST /verify-email/` - Verify email address

### Startup Profiles (`/api/v1/profile/`)
- `GET /` - Get startup profile
- `POST /` - Create/update startup profile
- `POST /complete-onboarding/` - Mark onboarding complete
- `GET /status/` - Get profile and generation status

### AI Chat (`/api/v1/chat/`)
- `GET /conversations/` - List user conversations
- `POST /messages/` - Send message to AI copilot
- `GET /messages/history/` - Get conversation history

### Validation Reports (`/api/v1/validation-report/`)
- `GET /` - Get validation report (triggers generation if needed)

### Development Roadmaps (`/api/v1/roadmap/`)
- `GET /` - Get development roadmap
- `PATCH /tasks/{id}/` - Update task status

### Notifications (`/api/v1/notifications/`)
- `GET /` - List notifications
- `POST /{id}/read/` - Mark notification as read

### System (`/api/v1/`)
- `GET /health/` - Health check endpoint

## Database Schema

### Core Models

**User (accounts.User):**
- `email` (unique), `full_name`, `is_email_verified`
- `created_at`, `updated_at`

**StartupProfile (profiles.StartupProfile):**
- `user` (OneToOne), `sector`, `background_story`, `problem`
- `country`, `state`, `city`, `existing_experience`
- `key_skills`, `available_resources`, `team_status`
- `time_commitment`, `is_onboarding_complete`
- `generation_status`, `generation_started_at`, `generation_completed_at`

**ValidationReport (validation.ValidationReport):**
- `profile` (ForeignKey), `report_data` (JSON)
- `generated_at`, `version`

**Conversation (chat.Conversation):**
- `user` (ForeignKey), `profile` (ForeignKey)
- `created_at`, `updated_at`

**Message (chat.Message):**
- `conversation` (ForeignKey), `role`, `content`
- `created_at`

**PromptTemplate (ai.PromptTemplate):**
- `name`, `system_prompt`, `user_prompt_template`
- `few_shot_examples` (JSON), `version`, `is_active`

## Business Logic Flow

### 1. User Onboarding Flow
```
User Registration → Email Verification → Profile Creation → 
AI Generation Trigger → Validation Report → Development Roadmap → 
Conversational AI Access
```

### 2. AI Generation Pipeline
```
Profile Data → Serialization → Prompt Template Selection → 
AI API Call → Response Parsing → Structured Storage → 
User Notification → Status Update
```

### 3. Conversation Flow
```
User Message → Conversation Context → AI Provider Call → 
Response Generation → Message Storage → User Response
```

## Asynchronous Processing

### Celery Configuration
- **Broker**: Redis
- **Result Backend**: Database (django-celery-results)
- **Concurrency**: 4 workers
- **Task Time Limits**: 30 minutes hard, 25 minutes soft

### Scheduled Tasks (Celery Beat)
- Database-backed scheduler
- Periodic health checks
- Cleanup tasks for expired tokens
- Usage report generation

### Task Types
1. **AI Generation Tasks**: Report and roadmap generation
2. **Notification Tasks**: Email and in-app notifications
3. **Maintenance Tasks**: Database cleanup, log rotation
4. **Monitoring Tasks**: Health checks, performance metrics

## Configuration & Environment

### Environment Variables
```
# Database
DATABASE_URL=postgres://user:password@db:5432/startpilot
REDIS_URL=redis://redis:6379/0

# Security
DJANGO_SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=StartPilot <noreply@startpilot.io>

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key
AI_PROVIDER=gemini

# Frontend
FRONTEND_URL=http://localhost:3000

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Deployment Configuration
- **Development**: Docker Compose with hot reload
- **Production**: Multi-stage Docker build with Gunicorn
- **Scaling**: Horizontal scaling with load balancer
- **Monitoring**: Sentry for errors, Prometheus for metrics

## Security Considerations

### Authentication & Authorization
- JWT tokens with refresh capability
- Email verification for new accounts
- Password reset with secure tokens
- Google OAuth with proper scoping

### Data Protection
- HTTPS enforcement in production
- Secure password hashing
- Email masking in logs
- Input validation and sanitization

### Rate Limiting
- User-level rate limiting for API endpoints
- Special throttling for AI-heavy operations
- IP-based rate limiting for public endpoints

### Monitoring & Alerting
- Comprehensive error tracking with Sentry
- Performance monitoring with Prometheus
- Application logs with structured formatting
- Health check endpoints for infrastructure monitoring

## Development Workflow

### Local Development
```bash
# Start all services
docker compose up --build

# Run migrations
docker compose exec backend python manage.py migrate

# Create superuser
docker compose exec backend python manage.py createsuperuser

# Run tests
docker compose exec backend pytest
```

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- Mock testing for external services
- Performance testing for AI endpoints

### Code Quality
- Pre-commit hooks for linting
- Automated testing on CI/CD
- Code coverage reporting
- Documentation generation

## Performance Optimization

### Database Optimization
- Appropriate indexing on foreign keys and timestamps
- Query optimization with Django ORM best practices
- Connection pooling with persistent connections
- Regular database maintenance tasks

### Caching Strategy
- Redis cache for frequently accessed data
- Template fragment caching
- Query result caching for expensive operations
- Cache invalidation on data updates

### AI API Optimization
- Prompt optimization for token efficiency
- Response caching for similar queries
- Batch processing where applicable
- Usage monitoring and cost control

## Future Enhancements

### Planned Features
1. **Team Collaboration**: Multiple users per startup
2. **Investor Portal**: Pitch deck generation and sharing
3. **Market Research**: Automated competitor analysis
4. **Funding Tracker**: Investor outreach and tracking
5. **Milestone Tracking**: Progress visualization dashboard

### Technical Improvements
1. **Real-time Updates**: WebSocket support for live notifications
2. **Advanced Analytics**: User behavior and engagement metrics
3. **Multi-model AI**: Ensemble approach for better recommendations
4. **Mobile Optimization**: Progressive Web App support
5. **Internationalization**: Multi-language support

## Troubleshooting Guide

### Common Issues

1. **Database Connection Issues**
   - Check PostgreSQL service status
   - Verify DATABASE_URL environment variable
   - Ensure migrations are applied

2. **Redis Connection Issues**
   - Verify Redis service is running
   - Check REDIS_URL configuration
   - Test Celery worker connectivity

3. **AI API Errors**
   - Verify API key configuration
   - Check rate limits and quotas
   - Monitor token usage and costs

4. **Email Delivery Issues**
   - Verify SMTP configuration
   - Check email service credentials
   - Monitor email delivery logs

### Debugging Tools
- Django Debug Toolbar (development only)
- Django shell for direct database access
- Celery task monitoring via Flower
- Log aggregation with structured logging

## Support & Resources

### Documentation
- API documentation via Swagger UI
- Interactive API testing via ReDoc
- Code documentation via docstrings
- Deployment guides and checklists

### Monitoring
- Health check endpoints
- Performance metrics dashboard
- Error tracking dashboard
- Usage analytics and reports

### Community & Support
- Issue tracking and bug reporting
- Feature request submission
- Documentation contributions
- Community forum (planned)

---

*This documentation provides a comprehensive overview of the StartPilot backend system. For specific implementation details, refer to the source code and API documentation available at `/api/docs/` when the application is running.*


# Technical Implementation Details

## How the System Works: Complete Logic Flow

### 1. User Registration Flow

**Step-by-step Process:**
```
1. User submits registration form with email, password, full_name
2. RegisterView validates input via RegisterSerializer
3. register_user service creates User with hashed password
4. Email verification token is generated and stored
5. Welcome email is queued via Celery task
6. User receives email with verification link
7. User clicks link, token is validated, email marked verified
```

**Code Implementation:**
```python
# In accounts/views.py
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = services.register_user(**serializer.validated_data)
        return Response(UserSerializer(user).data, status=201)

# In accounts/services.py
@transaction.atomic
def register_user(email, password, full_name):
    user = User.objects.create_user(email=email, password=password, full_name=full_name)
    token = EmailVerificationToken.objects.create(user=user)
    send_welcome_email.delay(user.id, token.token)  # Celery task
    return user
```

### 2. Startup Profile Creation & AI Generation

**Trigger Conditions:**
- User completes profile and submits `POST /api/v1/profile/complete-onboarding/`
- System marks profile as ready for AI processing
- Celery task is triggered to generate validation report

**Generation Pipeline:**
```
1. Profile data is serialized to dict format
2. Active PromptTemplate for validation reports is loaded
3. Template variables are substituted with profile data
4. AI provider (Gemini) is called with system prompt and user prompt
5. Response is parsed and stored as ValidationReport
6. Profile status is updated to 'completed'
7. Notification is sent to user
8. Roadmap generation is triggered automatically
```

**Code Implementation:**
```python
# In profiles/views.py
class CompleteOnboardingView(APIView):
    def post(self, request):
        profile = request.user.startup_profile
        profile.is_onboarding_complete = True
        profile.generation_status = 'pending'
        profile.save()
        
        # Trigger async AI generation
        generate_validation_report.delay(profile.id)
        return Response({'status': 'AI generation started'})

# In validation/services.py
@transaction.atomic
def generate_validation_report(profile):
    # Serialize profile data
    profile_data = profile_to_dict(profile)
    
    # Load prompt template
    template = PromptTemplate.objects.get(name='validation_report', is_active=True)
    
    # Prepare prompt
    system_prompt = template.system_prompt
    user_prompt = template.user_prompt_template.format(profile_data=profile_data)
    
    # Call AI provider
    provider = AIProviderFactory.get_provider()
    response = provider.generate(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        few_shot_examples=template.few_shot_examples
    )
    
    # Store report
    report = ValidationReport.objects.create(
        profile=profile,
        report_data=parse_ai_response(response)
    )
    
    # Update profile status
    profile.generation_status = 'completed'
    profile.generation_completed_at = timezone.now()
    profile.save()
    
    # Trigger roadmap generation
    generate_roadmap.delay(profile.id)
    
    return report
```

### 3. Conversational AI System

**Context Management:**
- Each conversation is scoped to a StartupProfile
- Conversation history is maintained across sessions
- Profile context is automatically included in AI prompts
- System maintains context window for relevant history

**Message Flow:**
```
1. User sends message via POST /api/v1/chat/messages/
2. System retrieves or creates conversation for user's active profile
3. Message is saved with 'user' role
4. Conversation context (recent messages + profile data) is prepared
5. AI provider is called with conversation context
6. AI response is saved with 'assistant' role
7. Response is returned to user
```

**Code Implementation:**
```python
# In chat/views.py
class SendMessageView(APIView):
    throttle_classes = [AIRateThrottle]
    
    def post(self, request):
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        profile = request.user.startup_profile
        conversation = services.get_or_create_conversation(request.user, profile)
        
        # Save user message
        user_message = Message.objects.create(
            conversation=conversation,
            role='user',
            content=serializer.validated_data['content']
        )
        
        # Generate AI response
        response = services.generate_chat_response(
            conversation=conversation,
            user_message=user_message,
            profile=profile
        )
        
        # Save assistant response
        assistant_message = Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=response
        )
        
        return Response({
            'message': MessageSerializer(assistant_message).data
        })

# In chat/services.py
def generate_chat_response(conversation, user_message, profile):
    # Prepare conversation context
    recent_messages = Message.objects.filter(
        conversation=conversation
    ).order_by('-created_at')[:10]
    
    # Load chat prompt template
    template = PromptTemplate.objects.get(name='copilot_chat', is_active=True)
    
    # Prepare context
    context = {
        'profile_data': profile_to_dict(profile),
        'recent_messages': serialize_messages(recent_messages),
        'user_message': user_message.content
    }
    
    # Generate response
    provider = AIProviderFactory.get_provider()
    response = provider.generate(
        system_prompt=template.system_prompt,
        user_prompt=template.user_prompt_template.format(**context),
        few_shot_examples=template.few_shot_examples
    )
    
    return response
```

### 4. AI Provider Factory Pattern

**Design Pattern Benefits:**
- Decouples AI provider implementation from business logic
- Enables runtime provider switching via configuration
- Facilitates testing with mock providers
- Simplifies adding new AI providers

**Implementation:**
```python
# In ai/services.py
class AIProviderFactory:
    _instance = None
    _provider_name = None
    
    @classmethod
    def get_provider(cls):
        configured = settings.AI_PROVIDER
        
        if cls._instance is None or cls._provider_name != configured:
            if configured not in _PROVIDER_REGISTRY:
                raise ValueError(f"Unknown AI provider: {configured}")
            
            import_path = _PROVIDER_REGISTRY[configured]
            module_name, class_name = import_path.rsplit('.', 1)
            module = import_module(module_name)
            provider_class = getattr(module, class_name)
            
            cls._instance = provider_class()
            cls._provider_name = configured
        
        return cls._instance

# In ai/providers/base.py
class BaseAIProvider(ABC):
    @abstractmethod
    def generate(self, system_prompt, user_prompt, few_shot_examples=None):
        pass
    
    @abstractmethod
    def count_tokens(self, text):
        pass

# In ai/providers/gemini.py
class GeminiProvider(BaseAIProvider):
    def __init__(self):
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def generate(self, system_prompt, user_prompt, few_shot_examples=None):
        # Implementation using Gemini API
        pass
```

### 5. Error Handling & Monitoring

**Custom Exception Hierarchy:**
```
BaseException
├── APIException (DRF)
│   ├── ValidationError
│   ├── AuthenticationError
│   └── PermissionError
├── StartPilotException
│   ├── AIGenerationError
│   ├── ReportNotReadyError
│   ├── OnboardingNotCompleteError
│   └── ProfileNotFoundError
└── SystemException
```

**Error Response Format:**
```json
{
    "detail": "Human-readable error message",
    "field_errors": {
        "field_name": ["Error message 1", "Error message 2"]
    },
    "code": "ERROR_CODE",  # Optional error code
    "request_id": "uuid"   # For tracking in logs
}
```

**Monitoring Integration:**
- All exceptions are logged with structured format
- AI API errors are tracked separately for cost monitoring
- User-facing errors are sanitized (no stack traces)
- System errors trigger Sentry alerts

### 6. Performance Optimization Techniques

**Database Optimization:**
```python
# Proper indexing
class Meta:
    indexes = [
        models.Index(fields=['user', '-created_at']),
        models.Index(fields=['profile', 'generation_status']),
        models.Index(fields=['conversation', '-created_at']),
    ]

# Selective field loading
User.objects.only('email', 'full_name', 'is_email_verified')

# Prefetch related objects
Conversation.objects.select_related('profile').prefetch_related('messages')
```

**Caching Strategy:**
```python
# View-level caching
from django.views.decorators.cache import cache_page

@cache_page(60 * 5)  # 5 minutes
def get_validation_report(request):
    # Expensive operation
    pass

# Template fragment caching
{% load cache %}
{% cache 300 validation_report profile.id %}
    <!-- Expensive template rendering -->
{% endcache %}

# Low-level caching
from django.core.cache import cache

def get_cached_report(profile_id):
    key = f'validation_report:{profile_id}'
    report = cache.get(key)
    if report is None:
        report = generate_report(profile_id)
        cache.set(key, report, timeout=3600)  # 1 hour
    return report
```

### 7. Testing Strategy

**Unit Tests:**
```python
# Test business logic in isolation
def test_register_user_creates_user_and_token():
    user = register_user('test@example.com', 'password123', 'Test User')
    assert User.objects.filter(email='test@example.com').exists()
    assert EmailVerificationToken.objects.filter(user=user).exists()

# Mock external dependencies
@patch('apps.ai.services.AIProviderFactory.get_provider')
def test_generate_validation_report(mock_provider):
    mock_provider.return_value.generate.return_value = 'Mock AI response'
    report = generate_validation_report(profile)
    assert report.report_data is not None
```

**Integration Tests:**
```python
# Test API endpoints
def test_register_endpoint(client):
    response = client.post('/api/v1/auth/register/', {
        'email': 'test@example.com',
        'password': 'password123',
        'full_name': 'Test User'
    })
    assert response.status_code == 201
    assert 'email' in response.json()

# Test authentication flow
def test_protected_endpoint_requires_auth(client):
    response = client.get('/api/v1/profile/')
    assert response.status_code == 401
```

**Performance Tests:**
```python
# Test AI endpoint response times
def test_chat_response_within_time_limit():
    start_time = time.time()
    response = client.post('/api/v1/chat/messages/', 
        {'content': 'Test message'},
        HTTP_AUTHORIZATION=f'Bearer {token}'
    )
    elapsed = time.time() - start_time
    assert elapsed < 5.0  # Should respond within 5 seconds
    assert response.status_code == 200
```

### 8. Deployment & Scaling

**Docker Configuration:**
```dockerfile
# Multi-stage build for smaller image
FROM python:3.12-slim AS builder
# Install build dependencies
# Install Python packages

FROM python:3.12-slim AS final
# Copy installed packages
# Add non-root user
# Configure entrypoint
```

**Service Scaling:**
```yaml
# docker-compose.prod.yml
services:
  backend:
    image: startpilot-backend:latest
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
  
  celery_worker:
    image: startpilot-backend:latest
    command: celery -A config worker --loglevel=info --concurrency=8
    deploy:
      replicas: 2
  
  celery_beat:
    image: startpilot-backend:latest
    command: celery -A config beat --loglevel=info
    deploy:
      replicas: 1
```

**Health Checks:**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Conclusion

The StartPilot backend is designed as a scalable, maintainable platform for AI-powered startup incubation. Key architectural decisions include:

1. **Separation of Concerns**: Clear separation between views, services, and models
2. **Factory Pattern**: Swappable AI providers via configuration
3. **Async Processing**: Celery for background AI generation
4. **Comprehensive Testing**: Multi-layer testing strategy
5. **Performance Optimization**: Caching, indexing, and query optimization
6. **Monitoring & Observability**: Integrated error tracking and metrics

The system is built to handle growth from single-user prototypes to multi-tenant production deployments while maintaining code quality and developer productivity.


# Developer Quick Reference

## Common Development Tasks

### 1. Adding a New API Endpoint

**Step 1: Create Serializer**
```python
# apps/newapp/serializers.py
from rest_framework import serializers

class NewEndpointSerializer(serializers.Serializer):
    field1 = serializers.CharField(max_length=100)
    field2 = serializers.IntegerField(min_value=1)
    
    def validate(self, data):
        # Custom validation logic
        return data
```

**Step 2: Create Service**
```python
# apps/newapp/services.py
def new_business_logic(field1, field2):
    """Business logic goes here, not in views."""
    # Process data
    result = process_data(field1, field2)
    return result
```

**Step 3: Create View**
```python
# apps/newapp/views.py
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import NewEndpointSerializer
from . import services

class NewEndpointView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        request=NewEndpointSerializer,
        responses={200: YourResponseSerializer},
        summary="Endpoint description"
    )
    def post(self, request):
        serializer = NewEndpointSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        result = services.new_business_logic(**serializer.validated_data)
        
        return Response(YourResponseSerializer(result).data)
```

**Step 4: Add URL**
```python
# apps/newapp/urls.py
from django.urls import path
from .views import NewEndpointView

app_name = "newapp"

urlpatterns = [
    path("new-endpoint/", NewEndpointView.as_view(), name="new-endpoint"),
]
```

**Step 5: Register in Root URLs**
```python
# config/urls.py
path("api/v1/newapp/", include("apps.newapp.urls", namespace="newapp")),
```

### 2. Adding a New AI Provider

**Step 1: Create Provider Class**
```python
# apps/ai/providers/newprovider.py
from .base import BaseAIProvider

class NewProvider(BaseAIProvider):
    def __init__(self):
        # Initialize SDK with API key
        pass
    
    def generate(self, system_prompt, user_prompt, few_shot_examples=None):
        # Implementation
        pass
    
    def count_tokens(self, text):
        # Token counting logic
        pass
```

**Step 2: Register Provider**
```python
# apps/ai/services.py
_PROVIDER_REGISTRY: dict[str, str] = {
    "gemini": "apps.ai.providers.gemini.GeminiProvider",
    "newprovider": "apps.ai.providers.newprovider.NewProvider",  # Add this
}
```

**Step 3: Update Settings**
```python
# .env or settings
AI_PROVIDER=newprovider
NEWPROVIDER_API_KEY=your-api-key
```

### 3. Creating Database Migrations

```bash
# After modifying models
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

# Create data migration
docker compose exec backend python manage.py makemigrations --empty yourappname
```

### 4. Running Tests

```bash
# Run all tests
docker compose exec backend pytest

# Run specific test file
docker compose exec backend pytest apps/accounts/tests/test_views.py

# Run with coverage
docker compose exec backend pytest --cov=apps --cov-report=html

# Run with specific marker
docker compose exec backend pytest -m "not slow"
```

### 5. Debugging Techniques

**Django Shell:**
```bash
docker compose exec backend python manage.py shell

# Example usage
>>> from apps.accounts.models import User
>>> user = User.objects.get(email='test@example.com')
>>> from apps.profiles.models import StartupProfile
>>> profile = user.startup_profile
```

**Logging Configuration:**
```python
import logging
logger = logging.getLogger(__name__)

logger.debug("Debug message")
logger.info("Info message")
logger.warning("Warning message")
logger.error("Error message", exc_info=True)  # Include traceback
```

**Celery Task Monitoring:**
```bash
# Start Celery Flower (monitoring tool)
docker compose exec backend celery -A config flower

# Access at http://localhost:5555
```

### 6. Performance Profiling

**Database Query Analysis:**
```python
# Enable query logging
import logging
logging.getLogger('django.db.backends').setLevel(logging.DEBUG)

# Or use Django Debug Toolbar (development only)
```

**Response Time Monitoring:**
```python
# Custom middleware for timing
import time
from django.utils.deprecation import MiddlewareMixin

class ResponseTimeMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.time()
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            response['X-Response-Time'] = time.time() - request.start_time
        return response
```

## Code Style Guidelines

### Naming Conventions
- **Models**: PascalCase (User, StartupProfile)
- **Views**: PascalCase + View (RegisterView, ProfileView)
- **Serializers**: PascalCase + Serializer (UserSerializer)
- **Services**: snake_case (register_user, generate_report)
- **Variables**: snake_case (user_profile, validation_report)

### Import Organization
```python
# Standard library imports
import os
import logging
from datetime import datetime

# Third-party imports
from django.db import models
from rest_framework import serializers

# Local imports
from apps.core.models import BaseModel
from .services import business_logic
```

### Error Handling Pattern
```python
def business_function(param):
    try:
        # Main logic
        result = process(param)
        return result
    except SpecificError as e:
        logger.error(f"Specific error occurred: {e}", exc_info=True)
        raise BusinessLogicError("User-friendly message") from e
    except Exception as e:
        logger.exception("Unexpected error in business_function")
        raise SystemError("Internal server error") from e
```

## Common Issues & Solutions

### 1. Database Connection Issues
**Symptoms**: "relation does not exist", connection refused
**Solutions**:
```bash
# Check if migrations are applied
docker compose exec backend python manage.py showmigrations

# Reset database (development only)
docker compose down -v
docker compose up --build
```

### 2. Celery Task Not Executing
**Symptoms**: Tasks stuck in queue, no worker processing
**Solutions**:
```bash
# Check Celery worker status
docker compose logs celery_worker

# Restart Celery services
docker compose restart celery_worker celery_beat

# Check Redis connection
docker compose exec redis redis-cli ping
```

### 3. AI API Rate Limits
**Symptoms**: 429 errors, slow responses
**Solutions**:
- Implement exponential backoff in provider
- Add request queuing
- Monitor usage and upgrade API plan
- Implement response caching

### 4. Email Delivery Failures
**Symptoms**: No email received, SMTP errors
**Solutions**:
```bash
# Check email configuration
docker compose exec backend python manage.py check --deploy

# Test email sending
docker compose exec backend python manage.py sendtestemail user@example.com

# Check email logs
docker compose logs backend | grep -i email
```

## Production Checklist

### Before Deployment
- [ ] All migrations applied
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Backup strategy in place
- [ ] Monitoring configured (Sentry, Prometheus)
- [ ] Load testing completed
- [ ] Security scan passed

### After Deployment
- [ ] Health checks passing
- [ ] Error rate monitored
- [ ] Performance metrics collected
- [ ] User feedback gathered
- [ ] Backup verification successful

## Support & Resources

### Documentation Links
- **API Docs**: `http://localhost:8000/api/docs/`
- **Admin Panel**: `http://localhost:8000/admin/`
- **Metrics**: `http://localhost:8000/metrics`
- **Flower**: `http://localhost:5555` (when running)

### Useful Commands
```bash
# Database operations
docker compose exec backend python manage.py dbshell
docker compose exec backend python manage.py dumpdata > backup.json
docker compose exec backend python manage.py loaddata backup.json

# Cache operations
docker compose exec backend python manage.py clearcache
docker compose exec backend python manage.py createcachetable

# User management
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py changepassword <username>

# Static files
docker compose exec backend python manage.py collectstatic --noinput
```

### Getting Help
1. Check the logs: `docker compose logs [service]`
2. Review documentation in `/api/docs/`
3. Check for similar issues in codebase
4. Consult team members or project lead

---

*This documentation provides a comprehensive guide to understanding, developing, and maintaining the StartPilot backend. For specific questions or issues, refer to the source code or contact the development team.*