"""
factory_boy factories for the profiles app.
"""
import factory
from factory.django import DjangoModelFactory

from apps.accounts.tests.factories import UserFactory
from apps.profiles.models import DEFAULT_AVAILABLE_RESOURCES, StartupProfile


class StartupProfileFactory(DjangoModelFactory):
    """Factory for creating StartupProfile instances in tests."""

    user = factory.SubFactory(UserFactory)
    sector = "technology"
    background_story = factory.Faker("paragraph")
    problem = factory.Faker("paragraph")
    country = "Nigeria"
    state = "Lagos"
    city = "Lagos"
    existing_experience = factory.Faker("paragraph")
    key_skills = factory.LazyFunction(lambda: ["Python", "Django", "Marketing"])
    available_resources = factory.LazyFunction(lambda: DEFAULT_AVAILABLE_RESOURCES.copy())
    team_status = "solo"
    time_commitment = "full"
    onboarding_completed = False
    generation_status = "idle"

    class Meta:
        model = StartupProfile
        django_get_or_create = ("user",)


class CompletedProfileFactory(StartupProfileFactory):
    """Factory for profiles that have completed onboarding and AI generation."""

    onboarding_completed = True
    generation_status = "completed"
