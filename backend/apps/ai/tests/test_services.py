"""Tests for the AI provider factory and Gemini provider."""
import pytest
from unittest.mock import MagicMock, patch

from apps.ai.services import AIProviderFactory


@pytest.mark.django_db
class TestAIProviderFactory:
    """Tests for AIProviderFactory."""

    def setup_method(self):
        """Reset the singleton before each test."""
        AIProviderFactory.reset()

    def test_get_provider_returns_instance(self):
        with patch("apps.ai.providers.gemini.GeminiProvider.__init__", return_value=None):
            provider = AIProviderFactory.get_provider()
            assert provider is not None

    def test_get_provider_returns_same_instance(self):
        with patch("apps.ai.providers.gemini.GeminiProvider.__init__", return_value=None):
            p1 = AIProviderFactory.get_provider()
            p2 = AIProviderFactory.get_provider()
            assert p1 is p2

    def test_unknown_provider_raises_value_error(self):
        AIProviderFactory.reset()
        with patch("django.conf.settings.AI_PROVIDER", "unknown_provider"):
            from django.conf import settings
            settings.AI_PROVIDER = "unknown_provider"
            with pytest.raises(ValueError, match="Unknown AI provider"):
                AIProviderFactory._create_provider("unknown_provider")
            settings.AI_PROVIDER = "gemini"

    def test_reset_clears_cache(self):
        with patch("apps.ai.providers.gemini.GeminiProvider.__init__", return_value=None):
            p1 = AIProviderFactory.get_provider()
            AIProviderFactory.reset()
            p2 = AIProviderFactory.get_provider()
            assert p1 is not p2


@pytest.mark.django_db
class TestGeminiProviderJSONParsing:
    """Tests for GeminiProvider._parse_json_response."""

    def _make_provider(self):
        with patch("apps.ai.providers.gemini.GeminiProvider.__init__", return_value=None):
            from apps.ai.providers.gemini import GeminiProvider
            provider = GeminiProvider.__new__(GeminiProvider)
            return provider

    def test_parses_valid_json_dict(self):
        provider = self._make_provider()
        result = provider._parse_json_response('{"score": 75}')
        assert result == {"score": 75}

    def test_strips_markdown_fences(self):
        provider = self._make_provider()
        raw = "```json\n{\"score\": 80}\n```"
        result = provider._parse_json_response(raw)
        assert result == {"score": 80}

    def test_raises_on_invalid_json(self):
        provider = self._make_provider()
        with pytest.raises(ValueError, match="invalid JSON"):
            provider._parse_json_response("not json at all")

    def test_raises_on_missing_required_keys(self):
        provider = self._make_provider()
        with pytest.raises(ValueError, match="missing required keys"):
            provider._parse_json_response('{"score": 70}', required_keys={"score", "strengths"})

    def test_parses_list_type(self):
        provider = self._make_provider()
        result = provider._parse_json_response('[{"name": "Product"}]', expected_type=list)
        assert isinstance(result, list)
