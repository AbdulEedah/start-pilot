"""factory_boy factories for the validation app."""
import factory
from factory.django import DjangoModelFactory

from apps.profiles.tests.factories import CompletedProfileFactory
from apps.validation.models import ValidationReport


class ValidationReportFactory(DjangoModelFactory):
    """Factory for creating ValidationReport instances in tests."""

    profile = factory.SubFactory(CompletedProfileFactory)
    score = 72
    executive_summary = factory.Faker("paragraph")
    strengths = factory.LazyFunction(lambda: ["Strong domain expertise", "Lean team"])
    weaknesses = factory.LazyFunction(lambda: ["No technical co-founder", "Limited capital"])
    opportunities = factory.LazyFunction(lambda: ["Large underserved market"])
    risks = factory.LazyFunction(lambda: ["High competition", "Regulatory uncertainty"])
    recommendations = factory.LazyFunction(
        lambda: ["Validate pricing early", "Find a technical co-founder"]
    )
    market_analysis = factory.Faker("paragraph")
    competitor_analysis = factory.Faker("paragraph")
    founder_readiness = factory.Faker("paragraph")
    sector_considerations = factory.Faker("paragraph")
    action_plan = factory.Faker("paragraph")

    class Meta:
        model = ValidationReport
        django_get_or_create = ("profile",)
