"""factory_boy factories for the chat app."""
import factory
from factory.django import DjangoModelFactory

from apps.accounts.tests.factories import UserFactory
from apps.chat.models import Conversation, Message
from apps.profiles.tests.factories import CompletedProfileFactory


class ConversationFactory(DjangoModelFactory):
    user = factory.SubFactory(UserFactory)
    profile = factory.SubFactory(CompletedProfileFactory, user=factory.SelfAttribute("..user"))

    class Meta:
        model = Conversation


class UserMessageFactory(DjangoModelFactory):
    conversation = factory.SubFactory(ConversationFactory)
    role = "user"
    content = factory.Faker("sentence")

    class Meta:
        model = Message


class AssistantMessageFactory(DjangoModelFactory):
    conversation = factory.SubFactory(ConversationFactory)
    role = "assistant"
    content = factory.Faker("paragraph")

    class Meta:
        model = Message
