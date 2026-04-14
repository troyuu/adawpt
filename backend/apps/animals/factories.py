import datetime

import factory
from factory.django import DjangoModelFactory
from faker import Faker

from apps.accounts.factories import UserFactory
from apps.animals.models import Animal, AnimalImage, MedicalRecord

fake = Faker()


class AnimalFactory(DjangoModelFactory):
    """Factory for creating Animal instances."""

    class Meta:
        model = Animal

    name = factory.LazyAttribute(lambda o: fake.first_name())
    species = Animal.Species.DOG
    breed = factory.LazyAttribute(lambda o: fake.word().title())
    age_years = factory.LazyAttribute(lambda o: fake.random_int(min=0, max=15))
    age_months = factory.LazyAttribute(lambda o: fake.random_int(min=0, max=11))
    gender = Animal.Gender.MALE
    weight_kg = factory.LazyAttribute(
        lambda o: fake.pydecimal(left_digits=2, right_digits=2, positive=True, min_value=1, max_value=50)
    )
    color = factory.LazyAttribute(lambda o: fake.color_name())
    description = factory.LazyAttribute(lambda o: fake.paragraph())
    temperament = factory.LazyAttribute(lambda o: fake.sentence())
    special_needs = ""
    is_spayed_neutered = False
    is_vaccinated = False
    is_good_with_kids = True
    is_good_with_pets = True
    status = Animal.Status.AVAILABLE
    intake_date = factory.LazyFunction(datetime.date.today)
    created_by = factory.SubFactory(UserFactory, admin=True)


class AnimalImageFactory(DjangoModelFactory):
    """Factory for creating AnimalImage instances."""

    class Meta:
        model = AnimalImage

    animal = factory.SubFactory(AnimalFactory)
    image = factory.django.ImageField(filename="test_animal.jpg")
    caption = factory.LazyAttribute(lambda o: fake.sentence())
    is_primary = False
    order = factory.Sequence(lambda n: n)


class MedicalRecordFactory(DjangoModelFactory):
    """Factory for creating MedicalRecord instances."""

    class Meta:
        model = MedicalRecord

    animal = factory.SubFactory(AnimalFactory)
    record_type = MedicalRecord.RecordType.CHECKUP
    title = factory.LazyAttribute(lambda o: fake.sentence(nb_words=4))
    description = factory.LazyAttribute(lambda o: fake.paragraph())
    veterinarian = factory.LazyAttribute(lambda o: f"Dr. {fake.last_name()}")
    record_date = factory.LazyFunction(datetime.date.today)
    next_due_date = None
    created_by = factory.SubFactory(UserFactory, admin=True)
