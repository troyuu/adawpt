import os
import uuid
from django.conf import settings
from django.core.exceptions import ValidationError


def upload_to(instance, filename, folder):
    """Generate upload path: {folder}/{instance_id}/{uuid}.{ext}"""
    ext = filename.rsplit('.', 1)[-1].lower()
    new_filename = f'{uuid.uuid4().hex[:12]}.{ext}'
    instance_id = str(instance.id) if instance.id else 'temp'
    return os.path.join(folder, instance_id, new_filename)


def validate_image_file(file):
    """Validate uploaded image file type and size."""
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise ValidationError(
            f'Unsupported file type: {file.content_type}. '
            f'Allowed types: {", ".join(settings.ALLOWED_IMAGE_TYPES)}'
        )
    if file.size > settings.MAX_UPLOAD_SIZE:
        max_mb = settings.MAX_UPLOAD_SIZE / (1024 * 1024)
        raise ValidationError(f'File size exceeds maximum of {max_mb}MB.')
