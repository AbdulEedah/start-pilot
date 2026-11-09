"""
Gemini AI provider implementation for StartPilot.

Uses the google-generativeai SDK to call Gemini models.
Fetches active PromptTemplates from the database for each task type.
Logs every call to AIUsageLog.
"""
import json
import logging
import time

import google.generativeai as genai
from django.conf import settings

from apps.ai.providers.base import BaseAIProvider

logger = logging.getLogger(__name__)

# Default Gemini model to use
GEMINI_MODEL = getattr(settings, "GEMINI_MODEL", "gemini-3.5-flash-lite")

# Expected JSON keys for the validation report
VALIDATION_REPORT_KEYS = {
    "executive_summary",
    "score",
    "strengths",
    "weaknesses",
    "opportunities",
    "risks",
    "recommendations",
    "market_analysis",
    "competitor_analysis",
    "founder_readiness",
    "sector_considerations",
    "action_plan",
}


class GeminiProvider(BaseAIProvider):
    """
    Concrete AI provider using Google's Gemini API.

    Configuration is read from Django settings (GEMINI_API_KEY).
    Prompt templates are fetched from the PromptTemplate database table,
    allowing prompt engineering without code deployments.
    """

    def __init__(self):
        """Configure the Gemini SDK with the API key from settings."""
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self._model = genai.GenerativeModel(GEMINI_MODEL)

    # ─────────────────────────────────────────────────────────────────────────
    # Public interface
    # ─────────────────────────────────────────────────────────────────────────

    def generate_validation_report(self, profile_data: dict) -> dict:
        """
        Call Gemini to produce a startup validation report.

        Builds the prompt from the active 'validation_report' PromptTemplate,
        sends it to Gemini, and parses the JSON response.

        Args:
            profile_data: Serialised StartupProfile dict.

        Returns:
            Validated dict with all required report keys.

        Raises:
            ValueError: If the AI response cannot be parsed or is missing keys.
        """
        logger.info("Getting template...")
        template = self._get_template("validation_report")
        logger.info("Got template: %s", template)
        user_prompt = template.render(profile_data=json.dumps(profile_data, indent=2))
        logger.info("user prompt: %s", user_prompt)
        full_prompt = self._build_prompt(template, user_prompt)
        logger.info("Full prompt: %s", full_prompt)


        logger.info("Sending prommpt to gemini...")
        raw_response, usage = self._call_gemini(full_prompt)
        self._log_usage(
            user_id=profile_data.get("user_id"),
            template=template,
            task_type="validation_report",
            usage=usage,
            success=True,
        )

        return self._parse_json_response(raw_response, VALIDATION_REPORT_KEYS)

    def generate_roadmap(self, profile_data: dict, report_data: dict) -> list[dict]:
        """
        Call Gemini to produce a categorised startup roadmap.

        Args:
            profile_data: Serialised StartupProfile dict.
            report_data:  Serialised ValidationReport dict.

        Returns:
            List of category dicts, each containing a 'tasks' list.

        Raises:
            ValueError: If the AI response cannot be parsed.
        """
        template = self._get_template("roadmap")
        user_prompt = template.render(
            profile_data=json.dumps(profile_data, indent=2),
            report_data=json.dumps(report_data, indent=2),
        )
        full_prompt = self._build_prompt(template, user_prompt)

        raw_response, usage = self._call_gemini(full_prompt)
        self._log_usage(
            user_id=profile_data.get("user_id"),
            template=template,
            task_type="roadmap",
            usage=usage,
            success=True,
        )

        categories = self._parse_json_response(raw_response, expected_type=list)
        self._validate_roadmap_structure(categories)
        return categories

    def chat(
        self,
        conversation_history: list[dict],
        system_prompt: str,
        user_message: str,
    ) -> str:
        """
        Continue a conversation with the AI copilot.

        Converts the DRF conversation history into Gemini's turn format,
        then appends the new user message and calls the model.

        Args:
            conversation_history: List of {"role": "user"|"assistant", "content": str}.
            system_prompt:        System instruction containing startup context.
            user_message:         The latest message from the user.

        Returns:
            The assistant's response string.
        """
        # Map DRF role names to Gemini role names
        role_map = {"user": "user", "assistant": "model"}

        history = [
            {
                "role": role_map.get(msg["role"], "user"),
                "parts": [msg["content"]],
            }
            for msg in conversation_history
        ]

        # Build a model with the system prompt, with automatic fallback
        active_model = getattr(settings, "GEMINI_MODEL", "gemini-3.5-flash-lite")
        start = time.monotonic()
        try:
            model = genai.GenerativeModel(
                model_name=active_model,
                system_instruction=system_prompt,
            )
            chat_session = model.start_chat(history=history)
            response = chat_session.send_message(user_message)
        except Exception as exc:
            logger.warning("Gemini chat with model '%s' failed (%s). Retrying with fallback model...", active_model, exc)
            fallback_model = "gemini-3.5-flash-lite" if active_model != "gemini-3.5-flash-lite" else "gemini-3.8-flash"
            model = genai.GenerativeModel(
                model_name=fallback_model,
                system_instruction=system_prompt,
            )
            chat_session = model.start_chat(history=history)
            response = chat_session.send_message(user_message)

        duration = time.monotonic() - start

        self._log_usage(
            user_id=None,
            template=None,
            task_type="chat",
            usage={"input_tokens": 0, "output_tokens": 0, "duration": duration},
            success=True,
        )

        return response.text.strip()

    # ─────────────────────────────────────────────────────────────────────────
    # Internal helpers
    # ─────────────────────────────────────────────────────────────────────────

    def _get_template(self, name: str):
        """
        Fetch the active PromptTemplate for the given name.

        Args:
            name: Template logical name (e.g. 'validation_report').

        Returns:
            Active PromptTemplate instance.

        Raises:
            ValueError: If no active template exists for the given name.
        """
        from apps.ai.models import PromptTemplate

        template = PromptTemplate.objects.filter(name=name, is_active=True).first()
        if not template:
            raise ValueError(
                f"No active PromptTemplate found for '{name}'. "
                "Please run the seed management command."
            )
        return template

    def _build_prompt(self, template, user_prompt: str) -> str:
        """
        Combine system prompt, few-shot examples, and the user prompt
        into a single text prompt for Gemini's generateContent API.

        Args:
            template:    PromptTemplate instance.
            user_prompt: Rendered user-side prompt.

        Returns:
            Full concatenated prompt string.
        """
        parts = [template.system_prompt, ""]

        # Append few-shot examples to help the model match expected format
        for example in template.few_shot_examples:
            parts.append(f"Example input:\n{example.get('input', '')}")
            parts.append(f"Example output:\n{example.get('output', '')}")
            parts.append("")

        parts.append(f"Now process the following:\n{user_prompt}")
        parts.append("\nRespond ONLY with valid JSON. Do not include markdown code fences.")
        return "\n".join(parts)

    def _call_gemini(self, prompt: str) -> tuple[str, dict]:
        """
        Send a prompt to Gemini and return the text response plus usage info.

        Args:
            prompt: Full assembled prompt string.

        Returns:
            Tuple of (response_text, usage_dict).

        Raises:
            RuntimeError: If the Gemini API returns an empty response.
        """
        active_model = getattr(settings, "GEMINI_MODEL", "gemini-3.5-flash-lite")
        start = time.monotonic()
        try:
            model = genai.GenerativeModel(active_model)
            response = model.generate_content(prompt)
        except Exception as exc:
            logger.warning("Gemini generate_content with '%s' failed (%s). Retrying with fallback model...", active_model, exc)
            fallback_model = "gemini-3.5-flash-lite" if active_model != "gemini-3.5-flash-lite" else "gemini-3.8-flash"
            model = genai.GenerativeModel(fallback_model)
            response = model.generate_content(prompt)
        duration = time.monotonic() - start

        text = response.text.strip() if response.text else ""
        if not text:
            raise RuntimeError("Gemini returned an empty response.")

        # Extract token counts if available
        usage = {
            "input_tokens": getattr(response.usage_metadata, "prompt_token_count", 0),
            "output_tokens": getattr(response.usage_metadata, "candidates_token_count", 0),
            "duration": duration,
        }
        return text, usage

    def _parse_json_response(
        self, raw: str, required_keys: set | None = None, expected_type=dict
    ):
        """
        Parse a JSON string from the AI response.

        Strips markdown code fences if present, then parses.

        Args:
            raw:           Raw string from the AI response.
            required_keys: Optional set of keys to validate in the parsed dict.
            expected_type: Expected Python type (dict or list).

        Returns:
            Parsed Python object (dict or list).

        Raises:
            ValueError: If parsing fails or required keys are missing.
        """
        # Strip markdown code fences that models sometimes add
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            # Remove first and last fence lines
            cleaned = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse Gemini JSON response: %s\nRaw: %s", exc, raw[:500])
            raise ValueError(f"AI returned invalid JSON: {exc}") from exc

        if not isinstance(data, expected_type):
            raise ValueError(
                f"Expected AI response to be a {expected_type.__name__}, "
                f"got {type(data).__name__}."
            )

        if required_keys and isinstance(data, dict):
            missing = required_keys - set(data.keys())
            if missing:
                raise ValueError(
                    f"AI response is missing required keys: {', '.join(sorted(missing))}."
                )

        return data

    def _validate_roadmap_structure(self, categories: list) -> None:
        """
        Validate that the roadmap response has the expected structure.

        Args:
            categories: Parsed list from the AI response.

        Raises:
            ValueError: If the structure is invalid.
        """
        if not categories:
            raise ValueError("AI returned an empty roadmap.")

        for idx, cat in enumerate(categories):
            if not isinstance(cat, dict):
                raise ValueError(f"Roadmap category at index {idx} is not an object.")
            if "name" not in cat:
                raise ValueError(f"Roadmap category at index {idx} is missing 'name'.")
            if "tasks" not in cat or not isinstance(cat["tasks"], list):
                raise ValueError(f"Roadmap category '{cat.get('name')}' has no tasks list.")

            for task_idx, task in enumerate(cat["tasks"]):
                required = {"title", "description", "priority", "start_week", "end_week"}
                missing = required - set(task.keys())
                if missing:
                    raise ValueError(
                        f"Task {task_idx} in category '{cat['name']}' missing keys: "
                        f"{', '.join(sorted(missing))}."
                    )

    def _log_usage(
        self,
        user_id,
        template,
        task_type: str,
        usage: dict,
        success: bool,
        error_message: str = "",
    ) -> None:
        """
        Persist an AIUsageLog record asynchronously.

        Uses a try/except so that logging failures never affect the main flow.
        """
        try:
            from apps.ai.models import AIUsageLog

            AIUsageLog.objects.create(
                user_id=user_id,
                provider="gemini",
                prompt_template=template,
                task_type=task_type,
                input_tokens=usage.get("input_tokens", 0),
                output_tokens=usage.get("output_tokens", 0),
                request_duration=usage.get("duration", 0.0),
                success=success,
                error_message=error_message,
            )
        except Exception as exc:
            # Log but never raise – usage logging must not break generation
            logger.warning("Failed to write AIUsageLog: %s", exc)
