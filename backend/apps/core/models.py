"""
Core abstract models shared across all StartPilot apps.
Every concrete model must inherit from BaseModel to gain
automatic timestamp tracking.
"""
from django.db import models


class BaseModel(models.Model):
    """
    Abstract base model that adds created_at / updated_at timestamps
    to every concrete model that inherits from it.
    """

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]
