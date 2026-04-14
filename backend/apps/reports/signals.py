from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import AnimalReport


@receiver(post_save, sender=AnimalReport)
def notify_on_new_report(sender, instance, created, **kwargs):
    """Send notification when a new animal report is submitted."""
    if not created:
        return

    # Placeholder: will be implemented when notifications app is created.
    # Potential actions:
    # - Notify nearby volunteers
    # - Send confirmation email to reporter
    # - Alert admin dashboard via WebSocket
    pass
