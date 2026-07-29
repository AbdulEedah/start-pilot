"""
factory_boy factories for the accounts app.
"""
import factory
from factory.django import DjangoModelFactory

from apps.accounts.models import EmailVerificationToken, PasswordResetToken, User


class UserFactory(DjangoModelFactory):
    """Factory for creating User instances in tests."""

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    full_name = factory.Faker("name")
    password = factory.PostGenerationMethodCall("set_password", "TestPass123!")
    is_active = True
    is_email_verified = False

    class Meta:
        model = User


class VerifiedUserFactory(UserFactory):
    """Factory for already email-verified users."""

    is_email_verified = True


class EmailVerificationTokenFactory(DjangoModelFactory):
    """Factory for EmailVerificationToken instances."""

    user = factory.SubFactory(UserFactory)

    class Meta:
        model = EmailVerificationToken


class PasswordResetTokenFactory(DjangoModelFactory):
    """Factory for PasswordResetToken instances."""

    user = factory.SubFactory(UserFactory)

    class Meta:
        model = PasswordResetToken
