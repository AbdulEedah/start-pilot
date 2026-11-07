"""
Models for the Admin Panel application.
"""
from django.db import models
from apps.core.models import BaseModel


class SystemSetting(models.Model):
    """
    Key-value store for global platform configurations.
    """
    key = models.CharField(max_length=100, unique=True, db_index=True)
    value = models.JSONField(default=dict)
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "system_settings"
        verbose_name = "system setting"
        verbose_name_plural = "system settings"

    def __str__(self):
        return f"{self.key}: {self.value}"

    @classmethod
    def get_setting(cls, key: str, default=None):
        try:
            return cls.objects.get(key=key).value
        except cls.DoesNotExist:
            return default

    @classmethod
    def set_setting(cls, key: str, value, description=""):
        obj, _ = cls.objects.update_or_create(
            key=key,
            defaults={"value": value, "description": description}
        )
        return obj


class PlatformResource(BaseModel):
    """
    Curated resource (tool, book, template, guide) managed by administrators.
    """
    RESOURCE_TYPES = [
        ("Tool", "Tool"),
        ("Book", "Book"),
        ("Guide", "Guide"),
        ("Template", "Template"),
        ("Community", "Community"),
    ]

    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default="Strategy")
    resource_type = models.CharField(max_length=50, choices=RESOURCE_TYPES, default="Tool")
    url = models.URLField(blank=True, default="")
    description = models.TextField(blank=True)
    sector = models.CharField(max_length=50, default="all")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "platform_resources"
        verbose_name = "platform resource"
        verbose_name_plural = "platform resources"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.resource_type})"


class Mentor(BaseModel):
    """
    Startup mentors and advisors managed by administrators.
    Founder users can view their expertise, contact them, or schedule advisory sessions.
    """
    AVAILABILITY_CHOICES = [
        ("available", "Available Now"),
        ("busy", "Busy - Responds in 24h"),
        ("offline", "Currently Offline"),
    ]

    name = models.CharField(max_length=200, verbose_name="mentor name")
    title = models.CharField(max_length=200, verbose_name="professional title", help_text="e.g. Venture Partner, Ex-VP Product")
    company = models.CharField(max_length=200, blank=True, default="", verbose_name="company or fund")
    avatar = models.URLField(blank=True, default="", verbose_name="avatar URL")
    sector = models.CharField(max_length=50, default="all", db_index=True, verbose_name="primary sector focus")
    bio = models.TextField(verbose_name="biography & background")
    background_story = models.TextField(
        blank=True,
        default="",
        verbose_name="background story & career journey",
        help_text="Detailed background story, career journey, startups founded or scaled, and notable milestones.",
    )
    expertise = models.JSONField(default=list, verbose_name="expertise tags", help_text="List of strings e.g. ['Seed Fundraising', 'Go-to-Market']")
    experience_years = models.CharField(max_length=50, default="10+ years", verbose_name="experience summary")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0, verbose_name="founder satisfaction rating")
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default="available", verbose_name="availability")

    # Direct contact & scheduling information
    contact_email = models.EmailField(verbose_name="contact email", help_text="Direct contact email for founders")
    linkedin_url = models.URLField(blank=True, default="", verbose_name="LinkedIn URL")
    calendly_url = models.URLField(blank=True, default="", verbose_name="Calendly or booking URL")
    phone = models.CharField(max_length=50, blank=True, default="", verbose_name="phone or WhatsApp")
    notes = models.TextField(blank=True, default="", verbose_name="internal admin notes")
    is_active = models.BooleanField(default=True, db_index=True, verbose_name="active status")

    class Meta:
        db_table = "mentors"
        verbose_name = "mentor"
        verbose_name_plural = "mentors"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.title} ({self.company})"
