"""
factory_boy factories for the ai app.
"""
import factory
from factory.django import DjangoModelFactory

from apps.ai.models import AIUsageLog, PromptTemplate
from apps.accounts.tests.factories import UserFactory


class PromptTemplateFactory(DjangoModelFactory):
    """Factory for PromptTemplate instances."""

    name = factory.Sequence(lambda n: f"template_{n}")
    version = 1
    system_prompt = "You are a helpful assistant."
    user_prompt_template = "Process this: {{input}}"
    few_shot_examples = factory.LazyFunction(list)
    is_active = True

    class Meta:
        model = PromptTemplate


class ValidationReportTemplateFactory(PromptTemplateFactory):
    """Factory pre-configured as a validation_report template."""

    name = "validation_report"
    system_prompt = "You are a startup validation expert. Return JSON."
    user_prompt_template = "{{profile_data}}"


class RoadmapTemplateFactory(PromptTemplateFactory):
    """Factory pre-configured as a roadmap template."""

    name = "roadmap"
    system_prompt = "You are a startup execution strategist. Return JSON array."
    user_prompt_template = "Profile: {{profile_data}}\nReport: {{report_data}}"


class CopilotTemplateFactory(PromptTemplateFactory):
    """Factory pre-configured as a copilot template."""

    name = "copilot"
    system_prompt = "You are StartPilot, an AI co-pilot. Context: {{startup_context}}"
    user_prompt_template = "{{user_message}}"


class AIUsageLogFactory(DjangoModelFactory):
    """Factory for AIUsageLog instances."""

    user = factory.SubFactory(UserFactory)
    provider = "gemini"
    task_type = "validation_report"
    input_tokens = 500
    output_tokens = 800
    request_duration = 3.5
    success = True

    class Meta:
        model = AIUsageLog
