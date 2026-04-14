from django.conf import settings
from django.db import models
from django.utils.text import slugify

from apps.core.models import TimestampedModel


class SuccessStory(TimestampedModel):
    """Published adoption success stories."""

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True)
    body = models.TextField()
    excerpt = models.TextField(blank=True, default='')
    featured_image = models.ImageField(upload_to='stories/', null=True, blank=True)
    animal = models.ForeignKey(
        'animals.Animal',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='success_stories',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='success_stories',
    )
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'success_stories'
        ordering = ['-created_at']
        verbose_name_plural = 'success stories'

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while SuccessStory.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class Event(TimestampedModel):
    """Shelter events such as adoption drives, fundraisers, etc."""

    class EventType(models.TextChoices):
        ADOPTION_DRIVE = 'adoption_drive', 'Adoption Drive'
        FUNDRAISER = 'fundraiser', 'Fundraiser'
        VOLUNTEER_DAY = 'volunteer_day', 'Volunteer Day'
        WORKSHOP = 'workshop', 'Workshop'
        OTHER = 'other', 'Other'

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True)
    description = models.TextField()
    event_type = models.CharField(
        max_length=30,
        choices=EventType.choices,
    )
    featured_image = models.ImageField(upload_to='events/', null=True, blank=True)
    location = models.TextField(blank=True, default='')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_events',
    )

    class Meta:
        db_table = 'events'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Event.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
