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
import re

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
        2. Build the system prompt with full startup context and strict sector guardrail.
        3. Retrieve recent conversation history.
        4. Call the AI provider's chat method.
        5. Extract dynamic suggested questions.
        6. Persist the assistant's clean response.

    Args:
        conversation:  Active Conversation instance.
        user_message:  The founder's message text.

    Returns:
        The assistant's Message instance (with .suggested_questions attached).

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

    # Step 5: Extract dynamic suggested questions from model output
    suggested_questions = []
    clean_text = assistant_text
    match = re.search(r"\[SUGGESTED_QUESTIONS:\s*(\[.*?\])\s*\]", assistant_text, re.DOTALL)
    if match:
        try:
            parsed = json.loads(match.group(1))
            if isinstance(parsed, list):
                suggested_questions = [str(q).strip() for q in parsed if q]
            clean_text = re.sub(r"\[SUGGESTED_QUESTIONS:\s*\[.*?\]\s*\]", "", assistant_text, flags=re.DOTALL).strip()
        except Exception as parse_err:
            logger.warning("Could not parse suggested questions from model response: %s", parse_err)

    if not suggested_questions:
        suggested_questions = get_dynamic_suggested_questions(conversation.profile, conversation, user_message)

    # Step 6: Save the assistant response
    assistant_message = Message.objects.create(
        conversation=conversation,
        role="assistant",
        content=clean_text,
    )
    # Attach suggested questions to instance for the API view
    assistant_message.suggested_questions = suggested_questions

    # Touch conversation updated_at
    conversation.save(update_fields=["updated_at"])

    logger.info("Copilot responded in conversation %s", conversation.id)
    return assistant_message


def get_dynamic_suggested_questions(profile, conversation, user_message: str = "") -> list[str]:
    """
    Generate dynamic follow-up questions tailored to the founder's chosen sector,
    startup stage, and conversation context.
    """
    sector_name = profile.get_sector_display() if hasattr(profile, "get_sector_display") else str(profile.sector)
    country = getattr(profile, "country", "") or "my target market"
    msg_lower = (user_message or "").lower()

    if any(k in msg_lower for k in ["viability", "validate", "market size", "evaluate", "potential", "score"]):
        return [
            f"What are the top 3 regulatory or market barriers for {sector_name} in {country}?",
            f"How should I structure my first 10 customer validation interviews in {sector_name}?",
            f"What MVP features are essential to test demand before building full scale?",
        ]
    elif any(k in msg_lower for k in ["mvp", "product", "features", "build", "tech", "prototype", "architecture"]):
        return [
            f"How do I acquire my first 50 early adopters in {sector_name}?",
            f"What monetization model fits this {sector_name} solution best?",
            f"Which key metrics should I track during beta testing?",
        ]
    elif any(k in msg_lower for k in ["pitch", "deck", "investor", "fundraising", "capital", "raise", "valuation"]):
        return [
            f"What metrics do angel investors look for in {sector_name} startups?",
            f"How do I define my startup's unfair advantage or competitive moat in {sector_name}?",
            f"Help me craft a 60-second elevator pitch for {sector_name} investors.",
        ]
    elif any(k in msg_lower for k in ["marketing", "customer", "traction", "sales", "go to market", "gtm", "distribution"]):
        return [
            f"Which marketing channels have the lowest CAC in {sector_name}?",
            f"How do I build a B2B sales pipeline or customer waitlist in {country}?",
            f"What referral incentives work best for early traction in {sector_name}?",
        ]
    else:
        return [
            f"Analyze the viability of my {sector_name} venture using my onboarding info.",
            f"What missing information do you need from me to evaluate my business model?",
            f"What is the recommended next milestone on my {sector_name} roadmap?",
        ]


def build_copilot_system_prompt(profile) -> str:
    """
    Build the full contextual system prompt for the Copilot, injecting the
    founder's complete onboarding profile, validation report, and roadmap summary,
    and enforcing the strict sector guardrail and onboarding viability protocol.

    Args:
        profile: StartupProfile instance.

    Returns:
        Rendered system prompt string.
    """
    sector_name = profile.get_sector_display() if hasattr(profile, "get_sector_display") else str(profile.sector)

    guardrail_instructions = (
        f"You are StartPilot, an elite AI co-pilot for early-stage startup founders.\n"
        f"You have access to the founder's complete onboarding profile, background story, problem statement, "
        f"location, available resources, validation report, and roadmap.\n\n"
        f"CRITICAL SECTOR GUARDRAIL (MANDATORY & UNBREAKABLE):\n"
        f"The founder has chosen and locked in the {sector_name.upper()} sector.\n"
        f"1. ALL advice, frameworks, market analysis, competitor examples, metrics, and strategies MUST strictly revolve around and stay anchored within the {sector_name} sector.\n"
        f"2. If the founder asks questions about other unrelated sectors, asks general off-topic questions, or tries to shift the conversation away, YOU MUST FIRMLY AND POLITELY ENFORCE THE SECTOR GUARDRAIL: immediately relate their inquiry back to their {sector_name} venture or remind them that as their Start Pilot Co-Pilot, your mission is 100% focused on maximizing their success in the {sector_name} sector. NEVER abandon this sector focus under any circumstances.\n\n"
        f"FOUNDER ONBOARDING & VIABILITY PROTOCOL:\n"
        f"You have complete visibility into all onboarding details about the founder and their startup (Idea, Problem, Sector, Location, Team, Experience, Skills, Resources, Validation Score).\n"
        f"When the founder asks to 'Analyze Viability' or evaluate their venture:\n"
        f"- Directly synthesize their actual onboarding details (problem solved, target market in their country/city, founder strengths, team, and resources).\n"
        f"- Deliver a clear, structured assessment covering Problem-Solution Fit, Market Opportunity in the {sector_name} sector, Founder-Market Fit, and Execution Feasibility.\n"
        f"- PROACTIVE INQUIRY: If any critical detail is missing or needed to accurately evaluate their viability or execution (e.g., target customer persona, pricing model, customer acquisition channel, unit economics), proactively ask the founder 1-2 focused, high-leverage questions to uncover it.\n\n"
        f"DYNAMIC SUGGESTED QUESTIONS:\n"
        f"At the very end of every response, you MUST provide exactly 3 dynamic suggested follow-up questions tailored to the current stage of the startup and the condition of this chat.\n"
        f"Format them on the final line as: [SUGGESTED_QUESTIONS: [\"question 1\", \"question 2\", \"question 3\"]]\n\n"
        f"Guidelines:\n"
        f"- Keep responses under 400 words unless a deeper breakdown is requested.\n"
        f"- Reference specific items from their onboarding profile, report, or roadmap.\n"
        f"- Be honest, analytical, practical, and direct."
    )

    context_parts = [f"**Founder Onboarding & Startup Profile:**\n{_profile_context(profile)}"]

    # Inject report context if available
    try:
        report = profile.validation_report
        context_parts.append(
            f"**Validation Report (Score: {report.score}/100):**\n"
            f"Executive Summary: {report.executive_summary}\n"
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
    return f"{guardrail_instructions}\n\nContext:\n{startup_context}"


def _profile_context(profile) -> str:
    """Format all onboarding profile fields as a rich, comprehensive string for the Copilot."""
    resources = profile.available_resources or {}
    financial = resources.get("financial", {}) if isinstance(resources, dict) else {}
    human = resources.get("human", {}) if isinstance(resources, dict) else {}
    time_res = resources.get("time", {}) if isinstance(resources, dict) else {}

    cap = financial.get('capital', 0) if isinstance(financial, dict) else 0
    sav = financial.get('savings', 0) if isinstance(financial, dict) else 0
    ts = human.get('team_size', 1) if isinstance(human, dict) else 1
    cfs = human.get('cofounders', 0) if isinstance(human, dict) else 0
    hrs = time_res.get('hours_per_week', 40) if isinstance(time_res, dict) else 40

    resource_summary = (
        f"Capital: ${cap:,}, Savings: ${sav:,}, "
        f"Team Size: {ts}, Cofounders: {cfs}, "
        f"Hours/week: {hrs}"
    )

    location = f"{profile.city or ''}, {profile.state or ''}, {profile.country or ''}".strip(", ")
    skills = ", ".join(profile.key_skills) if profile.key_skills else "General entrepreneurship"

    return (
        f"Chosen Sector: {profile.get_sector_display()} (LOCKED FOCUS)\n"
        f"Startup Idea / Founder Story: {profile.background_story or 'Early-stage venture'}\n"
        f"Core Problem Being Solved: {profile.problem}\n"
        f"Location / Market: {location or 'Global'}\n"
        f"Founder Domain Experience: {profile.existing_experience or 'First-time founder'}\n"
        f"Key Skills: {skills}\n"
        f"Team Composition: {profile.get_team_status_display()}\n"
        f"Time Commitment: {profile.get_time_commitment_display()}\n"
        f"Available Resources: {resource_summary}\n"
        f"Onboarding Status: {'Completed' if profile.onboarding_completed else 'In Progress'}"
    )
