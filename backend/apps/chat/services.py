"""
Business-logic services for the chat app.

Services:
    get_or_create_conversation  – Return (conversation, created) for a user+profile.
    get_conversation_history    – Return the last N messages as role/content dicts.
    send_message                – Build full context, call AI, persist both turns.
    build_copilot_system_prompt – Assemble the system prompt with startup context.
"""
import json
import logging

from django.db import transaction

from apps.ai.services import AIProviderFactory
from apps.core.exceptions import AIGenerationError

from .models import Conversation, Message

logger = logging.getLogger(__name__)

# How many previous messages to include as context
HISTORY_LIMIT = 10


def get_or_create_conversation(user, profile) -> tuple[Conversation, bool]:
    """
    Return the most recent conversation for this user+profile, or create one.

    For MVP, one conversation per user per profile is maintained.

    Args:
        user:    Authenticated User instance.
        profile: StartupProfile instance.

    Returns:
        Tuple of (conversation, created).
    """
    conversation = Conversation.objects.filter(user=user, profile=profile).order_by("-created_at").first()
    if conversation:
        return conversation, False
    conversation = Conversation.objects.create(user=user, profile=profile)
    return conversation, True


def get_conversation_history(conversation: Conversation, limit: int = HISTORY_LIMIT) -> list[dict]:
    """
    Return the last ``limit`` messages in the conversation as dicts.

    Args:
        conversation: Conversation instance.
        limit:        Maximum number of recent messages to include.

    Returns:
        List of {"role": "user"|"assistant", "content": str} dicts,
        ordered oldest to newest.
    """
    messages = (
        Message.objects.filter(conversation=conversation)
        .order_by("-created_at")[:limit]
    )
    # Reverse so they appear oldest-first for the AI context window
    return [{"role": m.role, "content": m.content} for m in reversed(list(messages))]


@transaction.atomic
def send_message(conversation: Conversation, user_message: str) -> Message:
    """
    Process a user message through the AI Copilot pipeline:
        1. Persist the user's message.
        2. Build the system prompt with full startup context.
        3. Retrieve recent conversation history.
        4. Call the AI provider's chat method.
        5. Persist the assistant's response.

    Args:
        conversation:  Active Conversation instance.
        user_message:  The founder's message text.

    Returns:
        The assistant's Message instance.

    Raises:
        AIGenerationError: If the AI provider returns an error.
    """
    # Step 1: Save the user message
    Message.objects.create(
        conversation=conversation,
        role="user",
        content=user_message,
    )

    # Step 2: Build contextual system prompt
    system_prompt = build_copilot_system_prompt(conversation.profile)

    # Step 3: Get recent history (excluding the message we just saved)
    history = get_conversation_history(conversation, limit=HISTORY_LIMIT)
    # Remove the last entry (user message just saved) to avoid duplication
    # since we pass user_message separately
    if history and history[-1]["role"] == "user" and history[-1]["content"] == user_message:
        history = history[:-1]

    # Step 4: Call AI
    provider = AIProviderFactory.get_provider()
    try:
        assistant_text = provider.chat(
            conversation_history=history,
            system_prompt=system_prompt,
            user_message=user_message,
        )
    except Exception as exc:
        logger.error("Copilot chat failed for conversation %s: %s", conversation.id, exc)
        raise AIGenerationError(detail="Copilot is temporarily unavailable. Please try again.") from exc

    # Step 5: Save the assistant response
    assistant_message = Message.objects.create(
        conversation=conversation,
        role="assistant",
        content=assistant_text,
    )

    # Touch conversation updated_at
    conversation.save(update_fields=["updated_at"])

    logger.info("Copilot responded in conversation %s", conversation.id)
    return assistant_message


def build_copilot_system_prompt(profile) -> str:
    """
    Build the full contextual system prompt for the Copilot, injecting the
    founder's profile, validation report, and roadmap summary.

    Falls back gracefully if report or roadmap are not yet available.

    Args:
        profile: StartupProfile instance.

    Returns:
        Rendered system prompt string.
    """
    from apps.ai.models import PromptTemplate

    template = PromptTemplate.objects.filter(name="copilot", is_active=True).first()
    if not template:
        # Fallback system prompt if no template is seeded
        return (
            "You are StartPilot, an AI co-pilot for startup founders. "
            "Provide concise, actionable advice."
        )

    context_parts = [f"**Startup Profile:**\n{_profile_context(profile)}"]

    # Inject report context if available
    try:
        report = profile.validation_report
        context_parts.append(
            f"**Validation Report (Score: {report.score}/100):**\n"
            f"Summary: {report.executive_summary}\n"
            f"Strengths: {', '.join(report.strengths)}\n"
            f"Weaknesses: {', '.join(report.weaknesses)}\n"
            f"Top Recommendations: {'; '.join(report.recommendations[:3])}"
        )
    except Exception:
        context_parts.append("**Validation Report:** Not yet generated.")

    # Inject roadmap context if available
    try:
        from apps.roadmaps.services import roadmap_to_context_dict
        roadmap = profile.roadmap
        roadmap_summary = roadmap_to_context_dict(roadmap)
        context_parts.append(
            f"**Roadmap ({roadmap.total_weeks} weeks):**\n"
            + json.dumps(roadmap_summary, indent=2)
        )
    except Exception:
        context_parts.append("**Roadmap:** Not yet generated.")

    startup_context = "\n\n".join(context_parts)
    return template.render(startup_context=startup_context)


def _profile_context(profile) -> str:
    """Format key profile fields as a readable string for the system prompt."""
    return (
        f"Sector: {profile.get_sector_display()}\n"
        f"Problem: {profile.problem}\n"
        f"Country: {profile.country}\n"
        f"Team: {profile.get_team_status_display()}\n"
        f"Time Commitment: {profile.get_time_commitment_display()}\n"
        f"Key Skills: {', '.join(profile.key_skills)}"
    )
