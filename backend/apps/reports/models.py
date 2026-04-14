import random
import string

from django.conf import settings
from django.db import models

from apps.core.models import TimestampedModel


class AnimalReport(TimestampedModel):
    """A report submitted for a stray or injured animal."""

    class AnimalType(models.TextChoices):
        DOG = 'dog', 'Dog'
        CAT = 'cat', 'Cat'
        BIRD = 'bird', 'Bird'
        OTHER = 'other', 'Other'

    class Urgency(models.TextChoices):
        CRITICAL = 'critical', 'Critical'
        HIGH = 'high', 'High'
        MEDIUM = 'medium', 'Medium'
        LOW = 'low', 'Low'

    class Status(models.TextChoices):
        SUBMITTED = 'submitted', 'Submitted'
        ACKNOWLEDGED = 'acknowledged', 'Acknowledged'
        DISPATCHED = 'dispatched', 'Dispatched'
        RESCUED = 'rescued', 'Rescued'
        SHELTERED = 'sheltered', 'Sheltered'
        CLOSED = 'closed', 'Closed'

    tracking_id = models.CharField(max_length=13, unique=True, blank=True)
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reports',
    )
    assigned_volunteer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_reports',
    )
    animal_type = models.CharField(max_length=50, choices=AnimalType.choices)
    description = models.TextField()
    urgency = models.CharField(max_length=20, choices=Urgency.choices)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED,
    )
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    address = models.TextField(blank=True, default='')
    reporter_name = models.CharField(max_length=200, blank=True, default='')
    reporter_phone = models.CharField(max_length=20, blank=True, default='')
    reporter_email = models.EmailField(blank=True, default='')
    admin_notes = models.TextField(blank=True, default='')
    resolved_at = models.DateTimeField(null=True, blank=True)
    resulting_animal = models.ForeignKey(
        'animals.Animal',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports',
    )

    class Meta:
        db_table = 'animal_reports'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tracking_id'], name='idx_reports_tracking_id'),
            models.Index(fields=['status'], name='idx_reports_status'),
            models.Index(fields=['urgency'], name='idx_reports_urgency'),
            models.Index(fields=['reporter'], name='idx_reports_reporter'),
            models.Index(fields=['assigned_volunteer'], name='idx_reports_volunteer'),
            models.Index(fields=['-created_at'], name='idx_reports_created_at'),
            models.Index(fields=['status', 'urgency'], name='idx_reports_status_urgency'),
        ]

    def __str__(self):
        return f'{self.tracking_id} - {self.get_animal_type_display()} ({self.get_status_display()})'

    @staticmethod
    def _generate_tracking_id():
        """Generate a tracking ID in format RPT-XXXX-XXXX."""
        chars = string.ascii_uppercase + string.digits
        part1 = ''.join(random.choices(chars, k=4))
        part2 = ''.join(random.choices(chars, k=4))
        return f'RPT-{part1}-{part2}'

    def save(self, *args, **kwargs):
        if not self.tracking_id:
            # Generate a unique tracking ID
            for _ in range(10):
                candidate = self._generate_tracking_id()
                if not AnimalReport.objects.filter(tracking_id=candidate).exists():
                    self.tracking_id = candidate
                    break
            else:
                # Fallback: extremely unlikely to collide 10 times
                self.tracking_id = self._generate_tracking_id()
        super().save(*args, **kwargs)


class ReportImage(TimestampedModel):
    """An image attached to an animal report."""

    report = models.ForeignKey(
        AnimalReport,
        on_delete=models.CASCADE,
        related_name='images',
    )
    image = models.ImageField(upload_to='reports/')
    caption = models.CharField(max_length=255, blank=True, default='')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'report_images'
        ordering = ['order', '-created_at']

    def __str__(self):
        return f'Image for {self.report.tracking_id} (#{self.order})'
