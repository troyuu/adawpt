from django.conf import settings
from django.db import models

from apps.core.models import TimestampedModel


class AdoptionApplication(TimestampedModel):
    """Adoption application submitted by a prospective adopter for an animal."""

    class Status(models.TextChoices):
        SUBMITTED = 'submitted', 'Submitted'
        UNDER_REVIEW = 'under_review', 'Under Review'
        INTERVIEW_SCHEDULED = 'interview_scheduled', 'Interview Scheduled'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        WITHDRAWN = 'withdrawn', 'Withdrawn'
        EXPIRED = 'expired', 'Expired'

    class HousingType(models.TextChoices):
        HOUSE = 'house', 'House'
        APARTMENT = 'apartment', 'Apartment'
        CONDO = 'condo', 'Condo'
        OTHER = 'other', 'Other'

    class OwnershipType(models.TextChoices):
        OWNS = 'owns', 'Owns'
        RENTS = 'rents', 'Rents'

    # Relationships
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='adoption_applications',
    )
    animal = models.ForeignKey(
        'animals.Animal',
        on_delete=models.CASCADE,
        related_name='adoption_applications',
    )

    # Application status
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.SUBMITTED,
    )

    # Housing information
    housing_type = models.CharField(max_length=30, choices=HousingType.choices)
    owns_or_rents = models.CharField(max_length=10, choices=OwnershipType.choices)
    landlord_permission = models.BooleanField(null=True)
    has_yard = models.BooleanField()

    # Household information
    other_pets = models.TextField(blank=True)
    children_info = models.TextField(blank=True)

    # Experience and schedule
    pet_experience = models.TextField()
    work_schedule = models.TextField()

    # References
    vet_reference = models.TextField(blank=True)
    personal_references = models.TextField()

    # Motivation and agreements
    reason_to_adopt = models.TextField()
    agrees_to_home_visit = models.BooleanField()

    # Staff / review fields
    staff_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    rejection_message = models.TextField(blank=True)
    interview_date = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_applications',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'adoption_applications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['applicant'], name='idx_adoptapp_applicant'),
            models.Index(fields=['animal'], name='idx_adoptapp_animal'),
            models.Index(fields=['status'], name='idx_adoptapp_status'),
            models.Index(fields=['-created_at'], name='idx_adoptapp_created'),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['applicant', 'animal'],
                condition=~models.Q(status__in=['rejected', 'withdrawn']),
                name='unique_active_application',
            ),
        ]

    def __str__(self):
        return f'Application #{self.pk} - {self.applicant} for {self.animal}'
