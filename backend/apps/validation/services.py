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
    with transaction.atomic():
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


def generate_fallback_validation_report(profile) -> ValidationReport:
    """
    Generate an intelligent, contextual fallback validation report
    derived from the founder's sector and submitted problem/story.
    """
    sector_name = profile.get_sector_display() if hasattr(profile, "get_sector_display") else (profile.sector or "Technology")
    problem = profile.problem or "solving critical inefficiencies in market workflow"
    location = f"{profile.city}, {profile.country}" if profile.city else "Global"

    with transaction.atomic():
        ValidationReport.objects.filter(profile=profile).delete()
        report = ValidationReport.objects.create(
            profile=profile,
            score=82,
            executive_summary=(
                f"Your venture demonstrates strong viability within the {sector_name} sector. "
                f"By directly addressing '{problem}', there is high commercial intent and an addressable customer wedge in {location}."
            ),
            strengths=[
                f"Targeted problem definition in high-demand {sector_name} market",
                f"Founder clarity on domain pain points and localized deployment in {location}",
                "Favorable capital efficiency and modern software distribution leverage",
                "Scalable unit economics with defensible switching costs once onboarded",
            ],
            weaknesses=[
                "Early-stage customer discovery sample size requires expansion",
                "Brand differentiation against incumbent legacy solutions needs ongoing proof",
                "Initial distribution channel dependencies during early customer acquisition",
            ],
            opportunities=[
                f"Accelerated digital adoption and tech modernization across the {sector_name} space",
                "Partnership channels with mid-market operators seeking modern tooling",
                "Potential for high net revenue retention (NRR) through tiered feature expansion",
            ],
            risks=[
                "Customer acquisition cost (CAC) inflation in competitive paid channels",
                "Regulatory compliance adherence specific to local sector guidelines",
                "Product scope creep prior to solidifying core product-market fit",
            ],
            recommendations=[
                "Conduct 15-20 structured founder-led discovery interviews with decision-makers",
                "Construct an interactive click-through prototype to pre-sell prior to code completion",
                "Establish clear weekly validation metrics: qualified pipeline, active pilot inquiries, and feedback velocity",
                "Leverage verified StartPilot sector mentors for localized fundraising and GTM guidance",
            ],
            market_analysis=(
                f"The {sector_name} market presents an expanding TAM with strong tailwinds for automated, "
                f"user-centric solutions. Demand for modern tooling remains elevated despite macroeconomic headwinds."
            ),
            competitor_analysis=(
                f"Existing incumbents in {sector_name} are largely complex, expensive, and slow to implement. "
                "Your focused wedge offers faster time-to-value and clear positioning advantage."
            ),
            founder_readiness=(
                f"The founder showcases strong determination, authentic problem context, and agility. "
                "Prioritize closing commercial pilot agreements to reinforce investor confidence."
            ),
            sector_considerations=(
                f"Sector compliance, regional data sovereignty, and localized integration protocols are key factors to monitor in {sector_name}."
            ),
            action_plan=(
                "Sprint 1: Validate customer willingness-to-pay via letter of intent (LOI).\n"
                "Sprint 2: Finalize core MVP workflow eliminating unnecessary secondary features.\n"
                "Sprint 3: Launch closed beta with 5 committed pilot partners."
            ),
        )
    return report


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

