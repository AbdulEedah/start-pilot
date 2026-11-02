"""factory_boy factories for the notifications app."""
import factory
from factory.django import DjangoModelFactory

from apps.accounts.tests.factories import UserFactory
from apps.notifications.models import Notification


class InAppNotificationFactory(DjangoModelFactory):
    user = factory.SubFactory(UserFactory)
    type = "in_app"
    category = "report_ready"
    subject = "Your report is ready!"
    message = factory.Faker("paragraph")
    is_read = False

    class Meta:
        model = Notification


class EmailNotificationFactory(DjangoModelFactory):
    user = factory.SubFactory(UserFactory)
    type = "email"
    category = "welcome"
    subject = "Welcome to StartPilot!"
    message = factory.Faker("paragraph")
    is_read = False

    class Meta:
        model = Notification
