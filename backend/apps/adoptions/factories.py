import factory
from factory.django import DjangoModelFactory
from faker import Faker

from apps.accounts.factories import UserFactory
from apps.adoptions.models import AdoptionApplication
from apps.animals.factories import AnimalFactory

fake = Faker()


class AdoptionApplicationFactory(DjangoModelFactory):
    """Factory for creating AdoptionApplication instances."""

    class Meta:
        model = AdoptionApplication

    applicant = factory.SubFactory(UserFactory)
    animal = factory.SubFactory(AnimalFactory)
    status = AdoptionApplication.Status.SUBMITTED
    housing_type = AdoptionApplication.HousingType.HOUSE
    owns_or_rents = AdoptionApplication.OwnershipType.OWNS
    landlord_permission = None
    has_yard = True
    other_pets = factory.LazyAttribute(lambda o: fake.sentence())
    children_info = factory.LazyAttribute(lambda o: fake.sentence())
    pet_experience = factory.LazyAttribute(lambda o: fake.paragraph())
    work_schedule = factory.LazyAttribute(lambda o: fake.sentence())
    vet_reference = factory.LazyAttribute(lambda o: fake.paragraph())
    personal_references = factory.LazyAttribute(lambda o: fake.paragraph())
    reason_to_adopt = factory.LazyAttribute(lambda o: fake.paragraph())
    agrees_to_home_visit = True
