"""factory_boy factories for the roadmaps app."""
import factory
from factory.django import DjangoModelFactory

from apps.profiles.tests.factories import CompletedProfileFactory
from apps.roadmaps.models import Roadmap, RoadmapCategory, RoadmapTask


class RoadmapFactory(DjangoModelFactory):
    profile = factory.SubFactory(CompletedProfileFactory)
    total_weeks = 12

    class Meta:
        model = Roadmap
        django_get_or_create = ("profile",)


class RoadmapCategoryFactory(DjangoModelFactory):
    roadmap = factory.SubFactory(RoadmapFactory)
    name = "Product"
    order = 0

    class Meta:
        model = RoadmapCategory


class RoadmapTaskFactory(DjangoModelFactory):
    category = factory.SubFactory(RoadmapCategoryFactory)
    title = factory.Sequence(lambda n: f"Task {n}")
    description = factory.Faker("paragraph")
    priority = "high"
    start_week = 1
    end_week = 2
    is_completed = False
    order = factory.Sequence(lambda n: n)

    class Meta:
        model = RoadmapTask
