"""
Business-logic services for the validation app.

Services:
    generate_validation_report – Call AI provider and persist the report.
    get_report_for_profile     – Retrieve the report or raise if not ready.
    profile_to_dict            – Serialise a StartupProfile for AI prompts.
"""
import logging

from django.db import transaction

from apps.ai.services import AIProviderFactory
from apps.core.exceptions import AIGenerationError, ReportNotReadyError

from .models import ValidationReport

logger = logging.getLogger(__name__)


def profile_to_dict(profile) -> dict:
    """
    Serialise a StartupProfile instance into a plain dict suitable for
    use in AI prompt templates.

    Args:
        profile: StartupProfile instance.

    Returns:
        Dict representation of the profile data.
    """
    return {
        "user_id": profile.user_id,
        "sector": profile.get_sector_display(),
        "background_story": profile.background_story,
        "problem": profile.problem,
        "country": profile.country,
        "state": profile.state,
        "city": profile.city,
        "existing_experience": profile.existing_experience,
        "key_skills": profile.key_skills,
        "available_resources": profile.available_resources,
        "team_status": profile.get_team_status_display(),
        "time_commitment": profile.get_time_commitment_display(),
    }


@transaction.atomic
def generate_validation_report(profile) -> ValidationReport:
    """
    Call the AI provider to generate a validation report for the given
    startup profile, then persist and return the result.

    If a report already exists for this profile it is replaced atomically.

    Args:
        profile: StartupProfile instance.

    Returns:
        Newly created ValidationReport instance.

    Raises:
        AIGenerationError: If the AI provider returns an error or invalid data.
    """
    provider = AIProviderFactory.get_provider()
    profile_data = profile_to_dict(profile)

    logger.info("Generating validation report for profile %s", profile.id)

    try:
        report_data = provider.generate_validation_report(profile_data)
    except Exception as exc:
        logger.error("AI validation report generation failed for profile %s: %s", profile.id, exc)
        raise AIGenerationError(detail=f"Validation report generation failed: {exc}") from exc

    # Delete existing report before creating a new one (replace semantics)
    ValidationReport.objects.filter(profile=profile).delete()

    report = ValidationReport.objects.create(
        profile=profile,
        score=int(report_data["score"]),
        executive_summary=report_data["executive_summary"],
        strengths=report_data["strengths"],
        weaknesses=report_data["weaknesses"],
        opportunities=report_data["opportunities"],
        risks=report_data["risks"],
        recommendations=report_data["recommendations"],
        market_analysis=report_data["market_analysis"],
        competitor_analysis=report_data["competitor_analysis"],
        founder_readiness=report_data["founder_readiness"],
        sector_considerations=report_data["sector_considerations"],
        action_plan=report_data["action_plan"],
    )

    logger.info(
        "ValidationReport created for profile %s (score=%s)", profile.id, report.score
    )
    return report


def get_report_for_profile(profile) -> ValidationReport:
    """
    Return the ValidationReport for a profile, or raise ReportNotReadyError.

    Args:
        profile: StartupProfile instance.

    Returns:
        ValidationReport instance.

    Raises:
        ReportNotReadyError: If no report has been generated yet.
    """
    try:
        return ValidationReport.objects.get(profile=profile)
    except ValidationReport.DoesNotExist:
        raise ReportNotReadyError()


def report_to_dict(report: ValidationReport) -> dict:
    """
    Serialise a ValidationReport to a plain dict for use in AI roadmap prompts.

    Args:
        report: ValidationReport instance.

    Returns:
        Dict representation of the report.
    """
    return {
        "score": report.score,
        "executive_summary": report.executive_summary,
        "strengths": report.strengths,
        "weaknesses": report.weaknesses,
        "opportunities": report.opportunities,
        "risks": report.risks,
        "recommendations": report.recommendations,
        "market_analysis": report.market_analysis,
        "competitor_analysis": report.competitor_analysis,
        "founder_readiness": report.founder_readiness,
        "sector_considerations": report.sector_considerations,
        "action_plan": report.action_plan,
    }
