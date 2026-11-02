"""Tests for ai app models."""
import pytest

from apps.ai.tests.factories import PromptTemplateFactory


@pytest.mark.django_db
class TestPromptTemplate:
    """Tests for the PromptTemplate model."""

    def test_str_representation(self):
        t = PromptTemplateFactory(name="roadmap", version=2, is_active=True)
        assert "roadmap" in str(t)
        assert "2" in str(t)

    def test_render_substitutes_placeholders(self):
        t = PromptTemplateFactory(
            user_prompt_template="Analyze this: {{profile_data}} and {{extra}}"
        )
        rendered = t.render(profile_data="my profile", extra="some extra")
        assert "my profile" in rendered
        assert "some extra" in rendered
        assert "{{profile_data}}" not in rendered

    def test_render_leaves_unused_placeholders_intact(self):
        t = PromptTemplateFactory(user_prompt_template="Hello {{name}}")
        rendered = t.render()
        assert "{{name}}" in rendered

    def test_unique_together_name_version(self):
        """Duplicate (name, version) must raise IntegrityError."""
        import pytest
        from django.db import IntegrityError
        PromptTemplateFactory(name="test_tmpl", version=1)
        with pytest.raises(IntegrityError):
            PromptTemplateFactory(name="test_tmpl", version=1)

    def test_few_shot_examples_defaults_to_empty_list(self):
        t = PromptTemplateFactory()
        assert isinstance(t.few_shot_examples, list)
