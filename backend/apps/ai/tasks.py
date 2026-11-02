"""
Celery tasks for the ai app.

Tasks:
    log_ai_usage – Background task to write AIUsageLog records without
                   blocking the main generation pipeline.
"""
import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(name="ai.log_ai_usage", ignore_result=True)
def log_ai_usage(
    user_id: int | None,
    provider: str,
    task_type: str,
    template_id: int | None,
    input_tokens: int,
    output_tokens: int,
    request_duration: float,
    success: bool,
    error_message: str = "",
) -> None:
    """
    Persist an AIUsageLog record in the background.

    Called after AI generation so that logging never blocks the response.

    Args:
        user_id:          PK of the User who triggered the request (nullable).
        provider:         Provider name string, e.g. 'gemini'.
        task_type:        Task identifier, e.g. 'validation_report'.
        template_id:      PK of the PromptTemplate used (nullable).
        input_tokens:     Number of prompt tokens consumed.
        output_tokens:    Number of completion tokens generated.
        request_duration: Wall-clock duration of the AI API call in seconds.
        success:          True if the call succeeded.
        error_message:    Error description if success=False.
    """
    from apps.ai.models import AIUsageLog

    try:
        AIUsageLog.objects.create(
            user_id=user_id,
            provider=provider,
            prompt_template_id=template_id,
            task_type=task_type,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            request_duration=request_duration,
            success=success,
            error_message=error_message,
        )
        logger.debug(
            "AIUsageLog created: provider=%s task=%s tokens=%d+%d",
            provider,
            task_type,
            input_tokens,
            output_tokens,
        )
    except Exception as exc:
        logger.error("Failed to create AIUsageLog: %s", exc)
