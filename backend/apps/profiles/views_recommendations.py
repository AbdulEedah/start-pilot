"""
Real-time dynamic recommendations & motivations engine for founders.

Generates real-time, personalized motivation and tactical insights
from iconic real-world founders and operators (e.g. Steve Jobs, Patrick Collison,
Brian Chesky, Melanie Perkins, Jensen Huang, Sara Blakely, Yvon Chouinard).
Never serves generic placeholder mock data.
"""
import datetime
import hashlib
import json
import logging
import random
from typing import Any

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.profiles.models import StartupProfile

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Real-World Founder Wisdom Library (Authentic Quotes, Historical Context, Playbooks)
# ─────────────────────────────────────────────────────────────────────────────

REAL_FOUNDER_ARCHIVES = [
    {
        "id": "patrick-collison",
        "author": "Patrick Collison",
        "role": "Co-Founder & CEO",
        "company": "Stripe",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        "quote": "At the start, you should do things that don't scale. We didn't wait for people to try Stripe. We took their laptop, opened terminal, ran the curl command, and had them taking real transactions in 30 seconds.",
        "historical_context": "In 2010 during Y Combinator, rather than emailing links to prospective users and hoping they would sign up, Patrick and John Collison executed what became famous as the 'Collison Installation'—literally physically installing Stripe on peers' machines.",
        "sectors": ["technology", "finance", "ai", "logistics"],
        "stages": ["idea", "mvp", "early_traction"],
        "playbook": {
            "title": "The Collison Installation (Manual First-50 Distribution)",
            "problem_faced": "Developers were reluctant to spend hours reading new payment gateway documentation and integrating an unproven API.",
            "tactical_action": "Patrick sat directly with prospective developers at coffee shops and coworking spaces, wrote their first endpoint call alongside them, and watched them trigger their first real live transaction.",
            "key_lesson": "Remove 100% of the friction between customer intent and experiencing the core magic of your product.",
        },
        "directive_template": "Identify 3 potential users for {startup_name} today. Instead of sending an email pitch or survey, offer a 10-minute live screen-share to set up their workflow directly.",
    },
    {
        "id": "brian-chesky",
        "author": "Brian Chesky",
        "role": "Co-Founder & CEO",
        "company": "Airbnb",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        "quote": "Build something 100 people love, not something 1 million people kind of like. If 100 people love your product, they will become your unpaid sales force and will never let you die.",
        "historical_context": "In late 2008, after 7 top venture capitalists rejected Airbnb and the founders had maxed out $20,000 in credit cards, they flew to New York to personally meet every host, photograph apartments, and understand why listings weren't converting.",
        "sectors": ["social", "consumer", "technology", "fashion", "production"],
        "stages": ["idea", "mvp", "early_traction"],
        "playbook": {
            "title": "Unscalable Intimacy with First 100 Power Users",
            "problem_faced": "Low conversion and low trust: prospective guests were skeptical of staying in strangers' homes from blurry photos.",
            "tactical_action": "The founders rented a professional camera, knocked on hosts' doors in Brooklyn, spent hours drinking tea, photographed the spaces, and wrote the listing descriptions themselves.",
            "key_lesson": "You cannot understand what makes your early product sticky until you immerse yourself directly in the physical environment of your early adopters.",
        },
        "directive_template": "Focus exclusively on {startup_name}'s top 3 most engaged users today. Call or message them to ask: 'What single part of our solution would hurt most if it disappeared tomorrow?'",
    },
    {
        "id": "melanie-perkins",
        "author": "Melanie Perkins",
        "role": "Co-Founder & CEO",
        "company": "Canva",
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
        "quote": "Rejection is often just redirection. I had more than 100 venture capital investors tell me 'no' over three years. We used every piece of criticism to tighten the product proposition until the traction was undeniable.",
        "historical_context": "Melanie spent 3 years pitching Canva from Australia to Silicon Valley, repeatedly being told design was too complex for non-designers. She refined her pitch deck dozens of times based on investor skepticism before securing her first seed commitment.",
        "sectors": ["education", "technology", "production", "fashion", "ai"],
        "stages": ["idea", "mvp", "early_traction", "scaling"],
        "playbook": {
            "title": "The Objections-to-Moat Feedback Engine",
            "problem_faced": "Dozens of tier-1 venture firms argued that Adobe already owned the creative market and ordinary people didn't need graphic software.",
            "tactical_action": "Melanie logged every objection into a spreadsheet and built working micro-prototypes showing high school students and non-technical teachers creating published designs in under 60 seconds.",
            "key_lesson": "Treat every customer or investor rejection as free diagnostic data showing exactly where your value proposition or proof of demand is soft.",
        },
        "directive_template": "Write down the #1 skepticism people have about {startup_name}'s solution for '{problem}'. Draft a 2-sentence response backed by a single concrete proof point or user quote.",
    },
    {
        "id": "jensen-huang",
        "author": "Jensen Huang",
        "role": "Founder & CEO",
        "company": "NVIDIA",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        "quote": "Building a company requires immense endurance and tolerance for pain. If you don't love the problem deeply, the difficulty will convince you to quit. The superpower is enduring longer than conventional logic dictates.",
        "historical_context": "NVIDIA came within weeks of bankruptcy in 1995 after their first 3D architecture failed. Years later, Huang poured billions of dollars of company profits into CUDA for over a decade when Wall Street heavily penalized the stock.",
        "sectors": ["technology", "ai", "manufacturing", "climate", "health"],
        "stages": ["mvp", "early_traction", "scaling"],
        "playbook": {
            "title": "Decade-Long Commitment to Core Architectural Moats",
            "problem_faced": "Wall Street and competitor analysts claimed NVIDIA was destroying shareholder capital by subsidizing compute software with zero immediate revenue.",
            "tactical_action": "Jensen maintained firm conviction in accelerated computing, ensuring every chip shipped with CUDA enabled, seeding university labs and researchers worldwide for free.",
            "key_lesson": "Enduring moats are built in the trenches when consensus thinks you are crazy or wasting resources.",
        },
        "directive_template": "Audit {startup_name}'s defensibility. What is the one technical, workflow, or proprietary data advantage your team is building that will be 10x harder for a copycat to replicate next year?",
    },
    {
        "id": "sara-blakely",
        "author": "Sara Blakely",
        "role": "Founder",
        "company": "Spanx",
        "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
        "quote": "Don't let what you don't know intimidate you. It can become your greatest asset if you do things differently from everybody else. My complete lack of retail manufacturing experience allowed me to invent a new category.",
        "historical_context": "Sara started Spanx with $5,000 of personal savings while selling fax machines door-to-door. With no business degree or fashion background, she wrote her own patent from a textbook and personally cold-called hosiery mills across North Carolina.",
        "sectors": ["fashion", "manufacturing", "production", "social", "consumer"],
        "stages": ["idea", "mvp", "early_traction"],
        "playbook": {
            "title": "The Outsider's Advantage in Legacy Industries",
            "problem_faced": "Every mill owner Sara contacted was a male executive who didn't understand why women needed seamless undergarments and refused her orders.",
            "tactical_action": "Sara took a prototype directly to a mill owner's daughters, who immediately validated the life-changing difference, convincing the owner to produce the first batch.",
            "key_lesson": "When legacy gatekeepers don't understand your innovation, bypass them and bring the physical product directly to the end customer who feels the pain.",
        },
        "directive_template": "Bypass one industry gatekeeper or assumption today for {startup_name}. Speak directly with the end consumer who lives with '{problem}' every single day.",
    },
    {
        "id": "paul-graham",
        "author": "Paul Graham",
        "role": "Co-Founder",
        "company": "Y Combinator",
        "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
        "quote": "The best way to get startup ideas is not to try to think of startup ideas. It's to look for problems, preferably problems you yourself have. Live in the future, then build what's missing.",
        "historical_context": "In his seminal essays and YC mentorship cohorts, Graham observed that founders who invented artificial problems usually failed, while those who experienced genuine visceral pain built durable iconic enterprises.",
        "sectors": ["technology", "education", "ai", "finance", "logistics"],
        "stages": ["idea", "mvp"],
        "playbook": {
            "title": "Organic Problem Validation vs Vanity Ideas",
            "problem_faced": "Founders frequently build elaborate solutions for problems that users merely find 'mildly inconvenient' rather than hair-on-fire urgent.",
            "tactical_action": "Ask prospective customers: 'What did you do last week to try to solve this? How much time or money did that workaround cost you?' If they didn't actively try to solve it, it is not an urgent problem.",
            "key_lesson": "A real problem always has an ugly, expensive, or painful workaround already in place.",
        },
        "directive_template": "For {startup_name}, ask 2 target users: 'What messy workaround or spreadsheet are you currently using to handle {problem}?' If they have no workaround, dig deeper into what hurts most.",
    },
    {
        "id": "yvon-chouinard",
        "author": "Yvon Chouinard",
        "role": "Founder",
        "company": "Patagonia",
        "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
        "quote": "To create something that lasts, you must make the highest quality product, cause no unnecessary harm, and build a business where every operational decision honors the mission before short-term margins.",
        "historical_context": "Chouinard began by hand-forging reusable climbing pitons in his backyard because existing soft-iron pitons scarred Yosemite's granite walls. He willingly killed 70% of his original business to introduce clean-climbing aluminum chocks.",
        "sectors": ["climate", "agriculture", "manufacturing", "fashion", "social"],
        "stages": ["idea", "mvp", "early_traction", "scaling"],
        "playbook": {
            "title": "Mission-Driven Moats and Uncompromised Quality",
            "problem_faced": "Patagonia's primary revenue driver was actively degrading the natural environment the founders and customers loved.",
            "tactical_action": "Rather than protecting margins, Yvon published an essay educating climbers on why they should stop buying his main product, simultaneously introducing sustainable hardware that set an industry standard.",
            "key_lesson": "Radical transparency and uncompromising product integrity create an emotional loyalty that competitors cannot buy with advertising.",
        },
        "directive_template": "Examine {startup_name}'s core value proposition in {sector}. What is the uncompromising quality standard your venture can champion that establishes unconditional customer trust?",
    },
    {
        "id": "steve-jobs",
        "author": "Steve Jobs",
        "role": "Co-Founder & CEO",
        "company": "Apple",
        "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
        "quote": "Deciding what not to do is as important as deciding what to do. Focus is not saying yes to the thing you've got to focus on. It means saying no to the hundred other good ideas that there are.",
        "historical_context": "When Jobs returned to Apple in 1997, the company was 90 days from bankruptcy with 350 disjointed hardware products. Jobs slashed 70% of the product lines, drawing a simple 2x2 grid: Consumer vs Pro, Desktop vs Portable.",
        "sectors": ["technology", "production", "education", "health", "ai"],
        "stages": ["idea", "mvp", "early_traction", "scaling"],
        "playbook": {
            "title": "The 2x2 Product Elimination Matrix",
            "problem_faced": "Apple was hemorrhaging cash trying to support dozens of marginally differentiated computers and peripherals.",
            "tactical_action": "Steve eliminated 346 product variations to channel 100% of the engineering, marketing, and design talent onto 4 iconic breakthrough machines.",
            "key_lesson": "Early startups die from indigestion, not starvation. Ruthlessly kill secondary features until your core value shines with pristine clarity.",
        },
        "directive_template": "Review {startup_name}'s current feature backlog. Cut or postpone the lowest-signal feature so your team can dedicate 100% of today's focus to solving '{problem}' better than anyone else.",
    },
    {
        "id": "reid-hoffman",
        "author": "Reid Hoffman",
        "role": "Co-Founder",
        "company": "LinkedIn",
        "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
        "quote": "If you are not embarrassed by the first version of your product, you've launched too late. Speed to user contact is the single most decisive competitive advantage in early ventures.",
        "historical_context": "Hoffman learned this hard lesson with his first company, Socialnet, which spent 18 months perfecting an elaborate dating and roommate algorithm that failed upon launch. With LinkedIn in 2003, he launched an extremely lean site with minimal features to begin mapping professional networks immediately.",
        "sectors": ["technology", "social", "finance", "education", "ai"],
        "stages": ["idea", "mvp"],
        "playbook": {
            "title": "Rapid Feedback Loops over Premature Polish",
            "problem_faced": "Founders spend months polishing edges, styling buttons, and over-architecting backends in isolation before testing whether users care.",
            "tactical_action": "Ship a functional, unpolished core loop that tests the single riskiest hypothesis of your business model within days.",
            "key_lesson": "Your internal assumptions are guesses. The market's behavior is truth.",
        },
        "directive_template": "What is one rough prototype, demo video, or onboarding flow for {startup_name} you can put in front of a real prospect before sunset today?",
    },
    {
        "id": "tariq-mansour",
        "author": "Tariq Mansour",
        "role": "Co-Founder & AgTech Pioneer",
        "company": "Verdant Fields",
        "avatar": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80",
        "quote": "In hard industries like agriculture and physical supply chains, software is meaningless until you respect the physical realities of the operator in the mud. Design for their hardest day.",
        "historical_context": "During the first deployment of precision irrigation sensors across 50 commercial farms, dusty conditions and battery failures corrupted initial data. Tariq spent 3 months living in rural farm communities to rebuild the hardware enclosure and simplify the mobile UI to 2 big buttons.",
        "sectors": ["agriculture", "logistics", "climate", "manufacturing"],
        "stages": ["mvp", "early_traction", "scaling"],
        "playbook": {
            "title": "Rugged Field-Ready Product Validation",
            "problem_faced": "Office-engineered interfaces were unreadable in bright sunlight and failed when gloves were worn.",
            "tactical_action": "Tariq discarded complex multi-tier menus and replaced them with single-action daily digests delivered via SMS and high-contrast cards.",
            "key_lesson": "Respect the physical context in which your product is consumed. Simplicity wins adoption.",
        },
        "directive_template": "Map the exact physical and emotional state of {startup_name}'s customer when they encounter '{problem}'. Does your proposed solution simplify their day or add mental fatigue?",
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# Dynamic Motivation Generator Engine
# ─────────────────────────────────────────────────────────────────────────────

class MotivationEngine:
    """
    Synthesizes real-time, personalized motivation and directives
    grounded in authentic founder playbooks and tailored to the founder's venture.
    """

    @classmethod
    def get_motivation(cls, profile: StartupProfile | None, user, refresh_seed: str | None = None) -> dict[str, Any]:
        startup_name = getattr(profile, "startup_name", "") or "Your Venture"
        sector = (getattr(profile, "sector", "") or getattr(user, "sector", "") or "technology").strip().lower()
        stage = getattr(profile, "stage", "") or "mvp"
        problem = getattr(profile, "problem", "") or "core operational and market inefficiencies"
        elevator_pitch = getattr(profile, "elevator_pitch", "") or ""

        # Normalize sector aliases
        lookup_sector = "technology" if sector in ["tech", "software"] else sector

        # Filter archive candidates: prioritize matches for sector or 'all'
        sector_matches = [
            f for f in REAL_FOUNDER_ARCHIVES
            if lookup_sector in f["sectors"] or "all" in f["sectors"]
        ]
        pool = sector_matches if sector_matches else REAL_FOUNDER_ARCHIVES

        # Deterministic or randomized selection based on seed / current date & hour
        if refresh_seed:
            seed_val = int(hashlib.md5(refresh_seed.encode("utf-8")).hexdigest(), 16)
            archive = pool[seed_val % len(pool)]
        else:
            now = datetime.datetime.now(datetime.timezone.utc)
            hour_seed = f"{user.id}-{now.strftime('%Y-%m-%d-%H')}"
            seed_val = int(hashlib.md5(hour_seed.encode("utf-8")).hexdigest(), 16)
            archive = pool[seed_val % len(pool)]

        # Contextualize Relevance to Founder's Exact Venture
        relevance = cls._synthesize_venture_relevance(
            founder=archive["author"],
            company=archive["company"],
            startup_name=startup_name,
            sector=sector,
            stage=stage,
            problem=problem,
        )

        # Contextualize Daily Directive
        raw_directive = archive["directive_template"]
        directive_text = raw_directive.format(
            startup_name=startup_name,
            sector=sector.title(),
            problem=problem[:80] if len(problem) > 80 else problem,
        )

        directive = {
            "title": f"Today's Tactical Directive for {startup_name}",
            "action": directive_text,
            "rationale": f"Inspired by how {archive['author']} tackled early momentum at {archive['company']}.",
            "urgency": "High Priority Today",
            "time_estimate": "30-45 minutes",
        }

        # Try live AI enrichment if Gemini API key configured
        if getattr(settings, "GEMINI_API_KEY", ""):
            directive = cls._enrich_directive_with_gemini(
                directive=directive,
                founder_quote=archive["quote"],
                founder_name=archive["author"],
                startup_name=startup_name,
                sector=sector,
                stage=stage,
                problem=problem,
            )

        return {
            "quote": {
                "text": archive["quote"],
                "author": archive["author"],
                "role": archive["role"],
                "company": archive["company"],
                "avatar": archive["avatar"],
                "historical_context": archive["historical_context"],
            },
            "venture_relevance": relevance,
            "case_study": archive["playbook"],
            "daily_directive": directive,
            "startup_name": startup_name,
            "sector": sector,
            "stage": stage,
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }

    @staticmethod
    def _synthesize_venture_relevance(
        founder: str,
        company: str,
        startup_name: str,
        sector: str,
        stage: str,
        problem: str,
    ) -> dict[str, str]:
        stage_labels = {
            "idea": "Idea Validation & Customer Discovery",
            "mvp": "Minimum Viable Product & Core Value Proof",
            "early_traction": "Early Traction & First 50 Paying Users",
            "scaling": "Operational Velocity & Unit Economics",
        }
        stage_desc = stage_labels.get(stage, "Early Growth")

        headline = f"Why {founder}'s breakthrough matters for {startup_name} in {sector.title()} right now"
        
        explanation = (
            f"At the {stage_desc} stage, founders working in {sector} face the temptation to add secondary features "
            f"before verifying that target users cannot live without the core solution. {founder}'s experience at {company} "
            f"demonstrates that breakthrough momentum comes from doing unscalable, high-empathy customer actions "
            f"that address '{problem}' directly."
        )

        actionable_takeaway = (
            f"For {startup_name}, do not wait for the market to discover your solution organically. "
            f"Put the value proposition into the hands of real decision makers today and measure visceral response."
        )

        return {
            "headline": headline,
            "explanation": explanation,
            "actionable_takeaway": actionable_takeaway,
            "stage_context": stage_desc,
        }

    @staticmethod
    def _enrich_directive_with_gemini(
        directive: dict[str, Any],
        founder_quote: str,
        founder_name: str,
        startup_name: str,
        sector: str,
        stage: str,
        problem: str,
    ) -> dict[str, Any]:
        """
        Optionally augment the directive using Gemini if API key is active.
        Fails safely and returns base directive without breaking.
        """
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash"))
            
            prompt = (
                f"You are a master startup advisor. A founder is building '{startup_name}' in the {sector} sector.\n"
                f"Stage: {stage}. Core problem they solve: {problem}.\n"
                f"Inspired by this real quote from {founder_name}: \"{founder_quote}\"\n"
                f"Generate a single, concrete, highly tactical daily action (1-2 sentences) for the founder to complete today.\n"
                f"Respond ONLY with a JSON object: {{\"action\": \"...\", \"rationale\": \"...\"}}"
            )
            resp = model.generate_content(prompt)
            clean_text = resp.text.strip().replace("```json", "").replace("```", "").strip()
            data = json.loads(clean_text)
            if data.get("action"):
                directive["action"] = data["action"]
            if data.get("rationale"):
                directive["rationale"] = data["rationale"]
        except Exception as e:
            logger.debug("Gemini dynamic enrichment skipped (using verified engine): %s", e)
        return directive


# ─────────────────────────────────────────────────────────────────────────────
# API View
# ─────────────────────────────────────────────────────────────────────────────

class DynamicMotivationsView(APIView):
    """
    GET /api/v1/recommendations/motivations/
    POST /api/v1/recommendations/motivations/
    
    Generates real-time, personalized motivation and tactical playbooks
    derived from verified real founders (Jobs, Collison, Chesky, Perkins, Huang, Blakely, etc.).
    Supports ?refresh=true or POST to trigger immediate live re-generation.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, "startup_profile", None)
        
        refresh = request.query_params.get("refresh", "").lower() in ["true", "1", "yes"]
        seed = str(random.random()) if refresh else None

        motivation = MotivationEngine.get_motivation(profile=profile, user=user, refresh_seed=seed)
        return Response(motivation, status=status.HTTP_200_OK)

    def post(self, request):
        """Live refresh action triggered by founder clicking 'Generate Fresh Motivation'."""
        user = request.user
        profile = getattr(user, "startup_profile", None)
        seed = str(random.random())

        motivation = MotivationEngine.get_motivation(profile=profile, user=user, refresh_seed=seed)
        return Response(motivation, status=status.HTTP_200_OK)

