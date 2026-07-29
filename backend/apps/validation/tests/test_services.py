"""Tests for validation services."""
import pytest
from unittest.mock import MagicMock, patch

from apps.core.exceptions import AIGenerationError, ReportNotReadyError
from apps.validation.models import ValidationReport
from apps.validation.services import (
    generate_validation_report,
    get_report_for_profile,
    profile_to_dict,
    report_to_dict,
)
from apps.profiles.tests.factories import CompletedProfileFactory
from apps.validation.tests.factories import ValidationReportFactory


MOCK_REPORT_DATA = {
    "score": 75,
    "executive_summary": "A strong startup.",
    "strengths": ["Domain expertise", "Clear problem"],
    "weaknesses": ["No funding"],
    "opportunities": ["Large market"],
    "risks": ["Competition"],
    "recommendations": ["Focus on MVP"],
    "market_analysis": "The market is large.",
    "competitor_analysis": "Few direct competitors.",
    "founder_readiness": "Founder is ready.",
    "sector_considerations": "Tech sector is dynamic.",
    "action_plan": "Build MVP in 30 days.",
}


@pytest.mark.django_db
class TestGenerateValidationReport:
    """Tests for generate_validation_report service."""

    @patch("apps.ai.services.AIProviderFactory.get_provider")
    def test_creates_report_from_ai_data(self, mock_factory):
        mock_provider = MagicMock()
        mock_provider.generate_validation_report.return_value = MOCK_REPORT_DATA
        mock_factory.return_value = mock_provider

        profile = CompletedProfileFactory()
        report = generate_validation_report(profile)

        assert report.score == 75
        assert report.executive_summary == "A strong startup."
        assert report.strengths == ["Domain expertise", "Clear problem"]

    @patch("apps.ai.services.AIProviderFactory.get_provider")
    def test_replaces_existing_report(self, mock_factory):
        mock_provider = MagicMock()
        mock_provider.generate_validation_report.return_value = MOCK_REPORT_DATA
        mock_factory.return_value = mock_provider

        profile = CompletedProfileFactory()
        ValidationReportFactory(profile=profile, score=50)

        new_report = generate_validation_report(profile)
        assert new_report.score == 75
        assert ValidationReport.objects.filter(profile=profile).count() == 1

    @patch("apps.ai.services.AIProviderFactory.get_provider")
    def test_raises_ai_generation_error_on_provider_failure(self, mock_factory):
        mock_provider = MagicMock()
        mock_provider.generate_validation_report.side_effect = RuntimeError("AI down")
        mock_factory.return_value = mock_provider

        profile = CompletedProfileFactory()
        with pytest.raises(AIGenerationError):
            generate_validation_report(profile)


@pytest.mark.django_db
class TestGetReportForProfile:
    """Tests for get_report_for_profile."""

    def test_returns_report_when_exists(self):
        report = ValidationReportFactory()
        fetched = get_report_for_profile(report.profile)
        assert fetched.pk == report.pk

    def test_raises_report_not_ready_when_missing(self):
        profile = CompletedProfileFactory()
        with pytest.raises(ReportNotReadyError):
            get_report_for_profile(profile)


@pytest.mark.django_db
class TestProfileToDict:
    """Tests for profile_to_dict serialisation."""

    def test_returns_expected_keys(self):
        profile = CompletedProfileFactory()
        data = profile_to_dict(profile)
        assert "sector" in data
        assert "problem" in data
        assert "key_skills" in data
        assert "available_resources" in data

    def test_sector_uses_display_value(self):
        profile = CompletedProfileFactory(sector="technology")
        data = profile_to_dict(profile)
        assert data["sector"] == "Technology"
