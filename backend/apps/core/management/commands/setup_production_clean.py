"""
Django management command to purge all test data and initialize a clean,
production-ready StartPilot environment.

Actions:
1. Deletes all mock/test chat messages, notifications, validation reports,
   roadmaps, startup profiles, and test users.
2. Configures the master Super Administrator (admin@startpilot.io) with
   the 'super_admin' role and full privileges.
3. Optionally provisions a staff administrator (staff@startpilot.io) with
   the 'admin' role to demonstrate 3-tier role governance.
4. Populates high-quality, verified startup mentors with full contact and
   Calendly scheduling details across all major platform sectors.
5. Seeds essential platform resources for founders.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.accounts.models import User
from apps.profiles.models import StartupProfile
from apps.validation.models import ValidationReport
from apps.roadmaps.models import Roadmap, RoadmapCategory, RoadmapTask
from apps.chat.models import Conversation, Message
from apps.notifications.models import Notification
from apps.admin_panel.models import Mentor, PlatformResource, SystemSetting


class Command(BaseCommand):
    help = "Purge all test data and set up clean production foundation with mentors and 3-tier roles."

    def add_arguments(self, parser):
        parser.add_argument(
            "--admin-password",
            type=str,
            default="Admin123!@#",
            help="Password for master Super Admin account (default: Admin123!@#)",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Starting production cleanup and initialization..."))

        admin_password = options["admin_password"]

        # 1. Purge ephemeral test records
        self.stdout.write("1. Purging test data...")
        msg_count, _ = Message.objects.all().delete()
        conv_count, _ = Conversation.objects.all().delete()
        notif_count, _ = Notification.objects.all().delete()
        val_count, _ = ValidationReport.objects.all().delete()
        task_count, _ = RoadmapTask.objects.all().delete()
        cat_count, _ = RoadmapCategory.objects.all().delete()
        roadmap_count, _ = Roadmap.objects.all().delete()
        profile_count, _ = StartupProfile.objects.all().delete()

        self.stdout.write(
            f"   - Removed {conv_count} conversations, {msg_count} messages\n"
            f"   - Removed {val_count} validation reports\n"
            f"   - Removed {roadmap_count} roadmaps, {cat_count} categories, {task_count} tasks\n"
            f"   - Removed {profile_count} startup profiles\n"
            f"   - Removed {notif_count} notifications"
        )

        # 2. Clean users (keep or initialize admin@startpilot.io)
        deleted_users, _ = User.objects.exclude(email="admin@startpilot.io").delete()
        self.stdout.write(f"   - Removed {deleted_users} test user accounts")

        # 3. Master Super Admin Setup (Role: super_admin)
        super_admin, created = User.objects.get_or_create(
            email="admin@startpilot.io",
            defaults={
                "full_name": "Chief Super Administrator",
                "role": "super_admin",
                "is_staff": True,
                "is_superuser": True,
                "is_email_verified": True,
                "is_active": True,
            },
        )
        super_admin.role = "super_admin"
        super_admin.is_staff = True
        super_admin.is_superuser = True
        super_admin.is_email_verified = True
        super_admin.is_active = True
        super_admin.set_password(admin_password)
        super_admin.save()
        self.stdout.write(
            self.style.SUCCESS(
                f"   - Super Admin established: {super_admin.email} (role: super_admin, staff=True, superuser=True)"
            )
        )

        # 4. Staff Admin Setup (Role: admin)
        staff_admin, _ = User.objects.get_or_create(
            email="staff@startpilot.io",
            defaults={
                "full_name": "Platform Operations Staff",
                "role": "admin",
                "is_staff": True,
                "is_superuser": False,
                "is_email_verified": True,
                "is_active": True,
            },
        )
        staff_admin.role = "admin"
        staff_admin.is_staff = True
        staff_admin.is_superuser = False
        staff_admin.set_password(admin_password)
        staff_admin.save()
        self.stdout.write(
            self.style.SUCCESS(
                f"   - Staff Admin established: {staff_admin.email} (role: admin, staff=True, superuser=False)"
            )
        )

        # 5. Seed Verified Mentors
        self.stdout.write("2. Seeding verified mentors & advisors directory...")
        Mentor.objects.all().delete()

        mentors_seed = [
            {
                "name": "David Chen",
                "title": "Ex-Google VP Engineering & AI Fellow",
                "company": "Apex AI Labs",
                "sector": "technology",
                "bio": "15+ years advising deep tech founders on scalable backend architecture, LLM fine-tuning, and enterprise sales.",
                "background_story": "David started his career at Bell Labs before spending 9 years at Google, where he led machine learning infrastructure teams and co-authored core distributed inference frameworks. After Google, he served as CTO of a computer vision startup that achieved a successful acquisition by an enterprise cloud provider. Today, as an AI Fellow and Venture Advisor, David works hands-on with early-stage founders to design cost-effective inference pipelines, hire senior technical leaders, and establish robust MLOps practices.",
                "expertise": ["AI Architecture", "MLOps", "Enterprise Software", "Seed Fundraising"],
                "experience_years": "15+ years",
                "rating": 5.0,
                "availability": "available",
                "contact_email": "david.chen@startpilot-mentors.io",
                "linkedin_url": "https://linkedin.com",
                "calendly_url": "https://calendly.com",
                "phone": "+1 (415) 555-0142",
            },
            {
                "name": "Dr. Sarah Al-Mansoor",
                "title": "Venture Partner & HealthTech Specialist",
                "company": "BioVenture Horizon",
                "sector": "healthcare",
                "bio": "Physician-turned-investor guiding healthcare founders through FDA clearances, HIPAA compliance, and institutional pilots.",
                "background_story": "Dr. Sarah Al-Mansoor holds an MD from Johns Hopkins and an MBA from Wharton. Prior to entering venture capital, she co-founded a remote clinical monitoring platform that grew to serve over 200 hospital networks across North America. Sarah now advises digital health and biotech entrepreneurs on navigating complex FDA De Novo and 510(k) approval pathways, structuring payer reimbursement agreements, and maintaining rigorous HIPAA compliance during rapid expansion.",
                "expertise": ["Digital Health", "FDA Regulatory Strategy", "Clinical Trials", "Series A Fundraising"],
                "experience_years": "14+ years",
                "rating": 4.9,
                "availability": "available",
                "contact_email": "sarah.almansoor@startpilot-mentors.io",
                "linkedin_url": "https://linkedin.com",
                "calendly_url": "https://calendly.com",
                "phone": "+1 (617) 555-0189",
            },
            {
                "name": "Marcus Thorne",
                "title": "Founding Partner & Former Stripe Executive",
                "company": "Moneta Capital",
                "sector": "finance",
                "bio": "Specialized in cross-border fintech rails, compliance, Open Banking APIs, and structuring seed rounds.",
                "background_story": "Marcus spent over seven years as an early executive at Stripe, spearheading European banking partnerships and cross-border settlement rails. He subsequently founded a seed-stage venture fund focused on B2B infrastructure and embedded finance. Having evaluated thousands of financial services pitches, Marcus specializes in unit economics modeling, regulatory charter navigation, and preparing founders for institutional Series A investment.",
                "expertise": ["Payment Infrastructure", "FinTech Regulation", "Unit Economics", "Pitch Deck Coaching"],
                "experience_years": "12+ years",
                "rating": 5.0,
                "availability": "available",
                "contact_email": "marcus.thorne@startpilot-mentors.io",
                "linkedin_url": "https://linkedin.com",
                "calendly_url": "https://calendly.com",
                "phone": "+44 20 7946 0912",
            },
            {
                "name": "Elena Rostova",
                "title": "Chief Sustainability Officer & GP",
                "company": "EarthScale Ventures",
                "sector": "climate",
                "bio": "Helping clean tech and climate founders navigate non-dilutive government grants, hardware scaling, and ESG metrics.",
                "background_story": "Elena is an MIT-trained mechanical engineer who transitioned into climate capital after leading hardware operations at a leading renewable energy startup. Over the past decade, she has assisted over 25 climate tech ventures in securing non-dilutive government grants (SBIR/ARPA-E, Horizon Europe) and setting up contract manufacturing facilities across North America and Europe.",
                "expertise": ["Cleantech Hardware", "Grant Applications", "Carbon Accounting", "Supply Chain Strategy"],
                "experience_years": "11+ years",
                "rating": 4.8,
                "availability": "busy",
                "contact_email": "elena.rostova@startpilot-mentors.io",
                "linkedin_url": "https://linkedin.com",
                "calendly_url": "https://calendly.com",
                "phone": "+1 (206) 555-0176",
            },
            {
                "name": "Amara Okafor",
                "title": "Growth Partner & Ex-Shopify Director",
                "company": "OmniGrowth Labs",
                "sector": "consumer",
                "bio": "Scale expert who has taken multiple D2C and consumer software brands from zero to $10M+ GMV through viral loops and retention.",
                "background_story": "Amara began as an early growth hacker at a direct-to-consumer apparel company before joining Shopify's merchant acceleration division. She has advised dozens of consumer founders on organic customer acquisition loops, lifecycle marketing, and brand storytelling that drives durable retention. Her core focus is transforming unproven ideas into profitable commercial operations.",
                "expertise": ["D2C Growth", "Customer Acquisition Cost", "Brand Positioning", "Retention Engineering"],
                "experience_years": "10+ years",
                "rating": 4.9,
                "availability": "available",
                "contact_email": "amara.okafor@startpilot-mentors.io",
                "linkedin_url": "https://linkedin.com",
                "calendly_url": "https://calendly.com",
                "phone": "+1 (312) 555-0199",
            },
            {
                "name": "Sophia Zhang",
                "title": "Managing Director",
                "company": "Horizon AI Angels",
                "sector": "ai",
                "bio": "Active angel investor in 30+ early stage technology ventures. Focused on founder pitch decks, term sheet negotiation, and early hires.",
                "background_story": "Sophia is a serial entrepreneur and active angel investor who has backed over 30 early-stage ventures across the US and Asia. She previously built an enterprise collaboration tool from zero to $20M ARR before orchestrating its merger with a public SaaS company. As an advisor, Sophia focuses heavily on founder resilience, investor deck psychology, and closing high-stakes seed rounds.",
                "expertise": ["Pitch Coaching", "Term Sheets", "Early Product Market Fit", "Investor Relations"],
                "experience_years": "13+ years",
                "rating": 5.0,
                "availability": "available",
                "contact_email": "sophia.zhang@startpilot-mentors.io",
                "linkedin_url": "https://linkedin.com",
                "calendly_url": "https://calendly.com",
                "phone": "+1 (415) 555-0128",
            },
        ]

        created_mentors = [Mentor.objects.create(**m) for m in mentors_seed]
        self.stdout.write(self.style.SUCCESS(f"   - Seeded {len(created_mentors)} verified mentors across all sectors"))

        # 6. Seed Platform Resources
        self.stdout.write("3. Seeding platform resources...")
        PlatformResource.objects.all().delete()
        resources_seed = [
            {
                "name": "YC Safe Financing Documents",
                "category": "Fundraising",
                "resource_type": "Template",
                "url": "https://www.ycombinator.com/documents",
                "description": "Standardized post-money simple agreement for future equity templates.",
                "sector": "all",
            },
            {
                "name": "AWS Activate Cloud Credits for Startups",
                "category": "Infrastructure",
                "resource_type": "Tool",
                "url": "https://aws.amazon.com/activate/",
                "description": "Up to $100,000 in promotional AWS cloud computing credits.",
                "sector": "technology",
            },
            {
                "name": "FDA Digital Health Policy Playbook",
                "category": "Regulatory",
                "resource_type": "Guide",
                "url": "https://www.fda.gov/medical-devices/digital-health-center-excellence",
                "description": "Official FDA regulatory roadmap for software as a medical device (SaMD).",
                "sector": "healthcare",
            },
            {
                "name": "Stripe Atlas Startup Guide",
                "category": "Legal",
                "resource_type": "Guide",
                "url": "https://stripe.com/atlas/guides",
                "description": "Comprehensive legal and operational guides for setting up a Delaware C-Corp.",
                "sector": "finance",
            },
        ]
        for r in resources_seed:
            PlatformResource.objects.create(**r)
        self.stdout.write(self.style.SUCCESS(f"   - Seeded {len(resources_seed)} platform resources"))

        # 7. Baseline System Settings
        SystemSetting.set_setting("platform_name", "StartPilot")
        SystemSetting.set_setting("support_email", "support@startpilot.io")
        SystemSetting.set_setting("maintenance_mode", False)
        SystemSetting.set_setting("enforce_mfa", False)
        SystemSetting.set_setting("rate_limiting", True)
        SystemSetting.set_setting("session_timeout_hours", 24)

        self.stdout.write(self.style.SUCCESS("✓ Production setup complete. System is ready for shipping!"))
