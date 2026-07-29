"""
Abstract base class for all StartPilot AI providers.

Every concrete provider (Gemini, OpenAI, etc.) must implement this interface.
Consumers import the interface or use AIProviderFactory — never a concrete class directly.
"""
import abc
from typing import Any


class BaseAIProvider(abc.ABC):
    """
    Abstract interface defining the AI capabilities required by StartPilot.

    All methods raise NotImplementedError if not overridden.
    Concrete providers must implement all three methods.
    """

    @abc.abstractmethod
    def generate_validation_report(self, profile_data: dict) -> dict:
        """
        Generate a startup validation report from the founder's profile.

        Args:
            profile_data: Dict representation of the StartupProfile.

        Returns:
            Dict with keys: executive_summary, score, strengths, weaknesses,
            opportunities, risks, recommendations, market_analysis,
            competitor_analysis, founder_readiness, sector_considerations, action_plan.
        """

    @abc.abstractmethod
    def generate_roadmap(self, profile_data: dict, report_data: dict) -> list[dict]:
        """
        Generate a categorised startup roadmap.

        Args:
            profile_data: Dict representation of the StartupProfile.
            report_data:  Dict representation of the ValidationReport.

        Returns:
            List of category dicts, each with:
            { "name": str, "tasks": [ { "title", "description", "priority",
              "start_week", "end_week" }, ... ] }
        """

    @abc.abstractmethod
    def chat(
        self,
        conversation_history: list[dict],
        system_prompt: str,
        user_message: str,
    ) -> str:
        """
        Continue a stateful conversation with the AI copilot.

        Args:
            conversation_history: List of {"role": "user"|"assistant", "content": str}.
            system_prompt:        Contextual system instruction.
            user_message:         The latest user message to respond to.

        Returns:
            The AI assistant's response as a plain string.
        """
