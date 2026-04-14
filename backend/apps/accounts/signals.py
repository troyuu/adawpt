from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import User


@receiver(post_save, sender=User)
def send_welcome_notification(sender, instance, created, **kwargs):
    """Create a welcome notification for new users."""
    if not created:
        return

    # Will be implemented when notifications app is created
    # For now, just a placeholder
    pass
