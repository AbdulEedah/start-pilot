"""
Reusable Django validators for StartPilot.
"""
import magic
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible


@deconstructible
class FileSizeValidator:
    """
    Validate that an uploaded file does not exceed max_size bytes.

    Args:
        max_size: Maximum allowed file size in bytes.
    """

    def __init__(self, max_size: int):
        self.max_size = max_size

    def __call__(self, value):
        """Raise ValidationError if the file exceeds max_size."""
        if value.size > self.max_size:
            limit_mb = self.max_size / (1024 * 1024)
            raise ValidationError(
                f"File size must be no more than {limit_mb:.1f} MB. "
                f"Your file is {value.size / (1024 * 1024):.1f} MB."
            )

    def __eq__(self, other):
        return isinstance(other, FileSizeValidator) and self.max_size == other.max_size


@deconstructible
class ImageMimeTypeValidator:
    """
    Validate that an uploaded file is a genuine image by inspecting its
    MIME type via libmagic (not just the extension).
    """

    ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp"}

    def __call__(self, value):
        """Raise ValidationError if the file MIME type is not an allowed image type."""
        value.seek(0)
        mime = magic.from_buffer(value.read(1024), mime=True)
        value.seek(0)
        if mime not in self.ALLOWED_MIME_TYPES:
            raise ValidationError(
                f"File type '{mime}' is not allowed. "
                f"Allowed types: {', '.join(sorted(self.ALLOWED_MIME_TYPES))}."
            )


def validate_avatar(value):
    """Combined validator for avatar uploads: size and MIME type."""
    FileSizeValidator(settings.MAX_AVATAR_SIZE)(value)
    ImageMimeTypeValidator()(value)
