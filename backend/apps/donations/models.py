from django.conf import settings
from django.db import models

from apps.core.models import TimestampedModel


class Donation(TimestampedModel):
    """Records financial donations to the shelter."""

    class DonationType(models.TextChoices):
        ONE_TIME = 'one_time', 'One Time'
        MONTHLY = 'monthly', 'Monthly'
        SPONSORSHIP = 'sponsorship', 'Sponsorship'

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'

    class RecurringStatus(models.TextChoices):
        ACTIVE = 'active', 'Active'
        PAUSED = 'paused', 'Paused'
        CANCELLED = 'cancelled', 'Cancelled'

    donor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='donations',
    )
    animal = models.ForeignKey(
        'animals.Animal',
        on_delete=models.SET_NULL,
        null=True,
        related_name='donations',
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    donation_type = models.CharField(
        max_length=20,
        choices=DonationType.choices,
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )
    payment_reference = models.CharField(max_length=100, blank=True, default='')
    is_anonymous = models.BooleanField(default=False)
    donor_name = models.CharField(max_length=200, blank=True, default='')
    donor_email = models.EmailField(blank=True, default='')
    message = models.TextField(blank=True, default='')
    is_recurring = models.BooleanField(default=False)
    recurring_status = models.CharField(
        max_length=20,
        choices=RecurringStatus.choices,
        blank=True,
        default='',
    )
    next_payment_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'donations'
        ordering = ['-created_at']

    def __str__(self):
        donor_display = self.donor_name or (self.donor.email if self.donor else 'Anonymous')
        return f'{donor_display} - {self.amount} ({self.donation_type})'
