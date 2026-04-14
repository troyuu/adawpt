from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import AdoptionApplication


@receiver(post_save, sender=AdoptionApplication)
def handle_application_status_change(sender, instance, created, **kwargs):
    """
    When an adoption application is approved:
    1. Set the animal's status to 'adopted'.
    2. Set the animal's adopted_by to the applicant.
    3. Set the animal's adoption_date to now.
    4. Auto-reject all other pending applications for the same animal.
    """
    if created:
        return

    if instance.status != AdoptionApplication.Status.APPROVED:
        return

    # Update the animal record
    animal = instance.animal
    animal.status = 'adopted'
    animal.adopted_by = instance.applicant
    animal.adoption_date = timezone.now().date()
    animal.save(update_fields=['status', 'adopted_by', 'adoption_date', 'updated_at'])

    # Auto-reject all other pending applications for the same animal
    other_applications = AdoptionApplication.objects.filter(
        animal=instance.animal,
    ).exclude(
        pk=instance.pk,
    ).exclude(
        status__in=[
            AdoptionApplication.Status.REJECTED,
            AdoptionApplication.Status.WITHDRAWN,
            AdoptionApplication.Status.EXPIRED,
        ],
    )

    other_applications.update(
        status=AdoptionApplication.Status.REJECTED,
        rejection_reason='Another applicant has been approved for this animal.',
        rejection_message='We appreciate your interest, but this animal has been adopted by another applicant.',
        reviewed_at=timezone.now(),
    )
