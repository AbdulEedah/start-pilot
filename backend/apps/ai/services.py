"""
AI service layer for StartPilot.

AIProviderFactory:
    Central registry that returns the configured AI provider instance.
    Consumers always call AIProviderFactory.get_provider() instead of
    instantiating a concrete provider directly.  This makes the provider
    swappable at runtime via the AI_PROVIDER setting.
"""
import logging

from django.conf import settings

from apps.ai.providers.base import BaseAIProvider

logger = logging.getLogger(__name__)

# Registry of provider name → import path for the concrete class
_PROVIDER_REGISTRY: dict[str, str] = {
    "gemini": "apps.ai.providers.gemini.GeminiProvider",
}


class AIProviderFactory:
    """
    Factory that resolves and returns the active AI provider singleton.

    The provider is configured via the AI_PROVIDER Django setting.
    The resolved instance is cached so the SDK is initialised only once
    per process lifetime.
    """

    _instance: BaseAIProvider | None = None
    _provider_name: str | None = None

    @classmethod
    def get_provider(cls) -> BaseAIProvider:
        """
        Return the singleton AI provider instance.

        If the configured provider has changed (e.g. in tests), the cached
        instance is discarded and a fresh one is created.

        Returns:
            Concrete BaseAIProvider implementation.

        Raises:
            ValueError: If the configured provider is not registered.
        """
        configured = settings.AI_PROVIDER

        if cls._instance is None or cls._provider_name != configured:
            cls._instance = cls._create_provider(configured)
            cls._provider_name = configured
            logger.info("AI provider initialised: %s", configured)

        return cls._instance

    @classmethod
    def _create_provider(cls, name: str) -> BaseAIProvider:
        """
        Instantiate the provider class registered under ``name``.

        Args:
            name: Provider identifier string, e.g. 'gemini'.

        Returns:
            New provider instance.

        Raises:
            ValueError: If the name is not in the registry.
        """
        if name not in _PROVIDER_REGISTRY:
            available = ", ".join(sorted(_PROVIDER_REGISTRY.keys()))
            raise ValueError(
                f"Unknown AI provider '{name}'. Available providers: {available}."
            )

        import importlib

        module_path, class_name = _PROVIDER_REGISTRY[name].rsplit(".", 1)
        module = importlib.import_module(module_path)
        provider_class = getattr(module, class_name)
        return provider_class()

    @classmethod
    def reset(cls) -> None:
        """
        Clear the cached provider instance.
        Primarily used in tests to force re-initialisation.
        """
        cls._instance = None
        cls._provider_name = None
