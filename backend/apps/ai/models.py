"""
AI app models for StartPilot.

Models:
    PromptTemplate – DB-stored, versioned prompt templates with few-shot examples.
    AIUsageLog     – Logs every AI API call for monitoring and cost tracking.
"""
from django.db import models

from apps.core.models import BaseModel


class PromptTemplate(BaseModel):
    """
    Versioned, database-stored prompt template for an AI generation task.

    Prompt templates are fetched dynamically at runtime, allowing prompt
    engineering iteration without code deployments. Only one version of
    each named template may be active at a time.

    Placeholder syntax in user_prompt_template uses {{key}} for variable
    substitution, e.g. {{profile_data}}, {{report_data}}.
    """

    name = models.CharField(
        max_length=100,
        verbose_name="template name",
        help_text="Unique logical name, e.g. 'validation_report', 'roadmap', 'copilot'.",
    )
    system_prompt = models.TextField(
        verbose_name="system prompt",
        help_text="The system-level instruction sent to the AI model.",
    )
    user_prompt_template = models.TextField(
        verbose_name="user prompt template",
        help_text=(
            "Template string with {{placeholder}} substitution tokens. "
            "Example placeholders: {{profile_data}}, {{report_data}}."
        ),
    )
    few_shot_examples = models.JSONField(
        default=list,
        verbose_name="few-shot examples",
        help_text=(
            "List of {\"input\": \"...\", \"output\": \"...\"} dicts used as "
            "in-context examples to guide the model's output format."
        ),
    )
    version = models.PositiveSmallIntegerField(
        default=1,
        verbose_name="version",
    )
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name="active",
        help_text="Only the active version of each named template is used.",
    )

    class Meta:
        db_table = "prompt_templates"
        verbose_name = "prompt template"
        verbose_name_plural = "prompt templates"
        unique_together = [("name", "version")]
        ordering = ["name", "-version"]
        indexes = [
            models.Index(fields=["name", "is_active"]),
        ]

    def __str__(self) -> str:
        return f"PromptTemplate(name={self.name}, version={self.version}, active={self.is_active})"

    def render(self, **context) -> str:
        """
        Render the user_prompt_template by replacing {{key}} placeholders
        with the provided keyword arguments.

        Args:
            **context: Key-value pairs matching placeholders in the template.

        Returns:
            Rendered prompt string ready to send to the AI model.
        """
        rendered = self.user_prompt_template
        for key, value in context.items():
            rendered = rendered.replace(f"{{{{{key}}}}}", str(value))
        return rendered


class AIUsageLog(models.Model):
    """
    Records every AI API call for cost tracking and monitoring.

    Not inheriting BaseModel deliberately – we use a single created_at
    timestamp and never update these records.
    """

    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="ai_usage_logs",
        verbose_name="user",
    )
    provider = models.CharField(
        max_length=50,
        default="gemini",
        verbose_name="AI provider",
        help_text="Name of the AI provider, e.g. 'gemini'.",
    )
    prompt_template = models.ForeignKey(
        PromptTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="usage_logs",
        verbose_name="prompt template",
    )
    task_type = models.CharField(
        max_length=50,
        verbose_name="task type",
        help_text="E.g. 'validation_report', 'roadmap', 'chat'.",
    )
    input_tokens = models.IntegerField(default=0, verbose_name="input tokens")
    output_tokens = models.IntegerField(default=0, verbose_name="output tokens")
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name="cost (USD)",
        help_text="Estimated cost in USD. Can be computed post-hoc.",
    )
    request_duration = models.FloatField(
        default=0.0,
        verbose_name="request duration (s)",
        help_text="Wall-clock time for the AI API request in seconds.",
    )
    success = models.BooleanField(default=True, verbose_name="success")
    error_message = models.TextField(blank=True, verbose_name="error message")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "ai_usage_logs"
        verbose_name = "AI usage log"
        verbose_name_plural = "AI usage logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["provider", "task_type"]),
        ]

    def __str__(self) -> str:
        return (
            f"AIUsageLog(user={self.user_id}, task={self.task_type}, "
            f"success={self.success}, tokens={self.input_tokens}+{self.output_tokens})"
        )
