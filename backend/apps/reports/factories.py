import factory
from factory.django import DjangoModelFactory
from faker import Faker

from apps.accounts.factories import UserFactory
from apps.reports.models import AnimalReport, ReportImage

fake = Faker()


class ReportFactory(DjangoModelFactory):
    """Factory for creating AnimalReport instances."""

    class Meta:
        model = AnimalReport

    reporter = factory.SubFactory(UserFactory)
    animal_type = AnimalReport.AnimalType.DOG
    description = factory.LazyAttribute(lambda o: fake.paragraph())
    urgency = AnimalReport.Urgency.MEDIUM
    status = AnimalReport.Status.SUBMITTED
    address = factory.LazyAttribute(lambda o: fake.address())
    reporter_name = factory.LazyAttribute(lambda o: fake.name())
    reporter_phone = factory.LazyAttribute(lambda o: fake.phone_number()[:20])
    reporter_email = factory.LazyAttribute(lambda o: fake.email())
    latitude = factory.LazyAttribute(
        lambda o: fake.pydecimal(left_digits=2, right_digits=8, positive=True, min_value=10, max_value=15)
    )
    longitude = factory.LazyAttribute(
        lambda o: fake.pydecimal(left_digits=3, right_digits=8, positive=True, min_value=120, max_value=125)
    )


class ReportImageFactory(DjangoModelFactory):
    """Factory for creating ReportImage instances."""

    class Meta:
        model = ReportImage

    report = factory.SubFactory(ReportFactory)
    image = factory.django.ImageField(filename="test_report.jpg")
    caption = factory.LazyAttribute(lambda o: fake.sentence())
    order = factory.Sequence(lambda n: n)
