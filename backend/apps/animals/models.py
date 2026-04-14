from django.conf import settings
from django.db import models

from apps.core.models import TimestampedModel


class Animal(TimestampedModel):
    """Represents an animal in the shelter system."""

    class Species(models.TextChoices):
        DOG = 'dog', 'Dog'
        CAT = 'cat', 'Cat'
        BIRD = 'bird', 'Bird'
        RABBIT = 'rabbit', 'Rabbit'
        OTHER = 'other', 'Other'

    class Gender(models.TextChoices):
        MALE = 'male', 'Male'
        FEMALE = 'female', 'Female'
        UNKNOWN = 'unknown', 'Unknown'

    class Status(models.TextChoices):
        INTAKE = 'intake', 'Intake'
        MEDICAL_EVALUATION = 'medical_evaluation', 'Medical Evaluation'
        TREATMENT = 'treatment', 'Treatment'
        AVAILABLE = 'available', 'Available'
        ADOPTION_PENDING = 'adoption_pending', 'Adoption Pending'
        ADOPTED = 'adopted', 'Adopted'
        FOSTERED = 'fostered', 'Fostered'
        TRANSFERRED = 'transferred', 'Transferred'
        DECEASED = 'deceased', 'Deceased'

    name = models.CharField(max_length=100)
    species = models.CharField(max_length=50, choices=Species.choices)
    breed = models.CharField(max_length=100, blank=True, default='')
    age_years = models.PositiveIntegerField(null=True, blank=True)
    age_months = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=Gender.choices)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    color = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True, default='')
    temperament = models.CharField(max_length=255, blank=True, default='')
    special_needs = models.TextField(blank=True, default='')
    is_spayed_neutered = models.BooleanField(default=False)
    is_vaccinated = models.BooleanField(default=False)
    is_good_with_kids = models.BooleanField(null=True, blank=True)
    is_good_with_pets = models.BooleanField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.INTAKE)
    intake_date = models.DateField()
    adoption_date = models.DateField(null=True, blank=True)
    adopted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='adopted_animals',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_animals',
    )

    class Meta:
        db_table = 'animals'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['species'], name='idx_animals_species'),
            models.Index(fields=['status'], name='idx_animals_status'),
            models.Index(fields=['gender'], name='idx_animals_gender'),
            models.Index(fields=['breed'], name='idx_animals_breed'),
            models.Index(fields=['-created_at'], name='idx_animals_created_at'),
            models.Index(fields=['species', 'status'], name='idx_animals_species_status'),
        ]

    def __str__(self):
        return f'{self.name} ({self.get_species_display()})'


class AnimalImage(TimestampedModel):
    """Image associated with an animal."""

    animal = models.ForeignKey(
        Animal,
        on_delete=models.CASCADE,
        related_name='images',
    )
    image = models.ImageField(upload_to='animals/')
    caption = models.CharField(max_length=255, blank=True, default='')
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'animal_images'
        ordering = ['order']

    def __str__(self):
        return f'Image for {self.animal.name} (order={self.order})'


class MedicalRecord(TimestampedModel):
    """Medical record for an animal."""

    class RecordType(models.TextChoices):
        VACCINATION = 'vaccination', 'Vaccination'
        TREATMENT = 'treatment', 'Treatment'
        SURGERY = 'surgery', 'Surgery'
        CHECKUP = 'checkup', 'Checkup'
        MEDICATION = 'medication', 'Medication'
        NOTE = 'note', 'Note'

    animal = models.ForeignKey(
        Animal,
        on_delete=models.CASCADE,
        related_name='medical_records',
    )
    record_type = models.CharField(max_length=30, choices=RecordType.choices)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    veterinarian = models.CharField(max_length=200, blank=True, default='')
    record_date = models.DateField()
    next_due_date = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_medical_records',
    )

    class Meta:
        db_table = 'medical_records'
        ordering = ['-record_date']

    def __str__(self):
        return f'{self.title} - {self.animal.name} ({self.record_date})'
