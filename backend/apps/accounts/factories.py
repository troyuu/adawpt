import factory
from factory.django import DjangoModelFactory
from faker import Faker

from apps.accounts.models import User

fake = Faker()


class UserFactory(DjangoModelFactory):
    """Factory for creating User instances with realistic fake data."""

    class Meta:
        model = User
        skip_postgeneration_save = True

    email = factory.LazyAttribute(lambda o: fake.unique.email())
    first_name = factory.LazyAttribute(lambda o: fake.first_name())
    last_name = factory.LazyAttribute(lambda o: fake.last_name())
    role = User.Role.USER
    phone = factory.LazyAttribute(lambda o: fake.phone_number()[:20])
    address = factory.LazyAttribute(lambda o: fake.address())
    is_active = True
    is_staff = False
    email_verified = False

    class Params:
        admin = factory.Trait(
            role=User.Role.ADMIN,
            is_staff=True,
            is_superuser=True,
            email_verified=True,
        )

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        password = kwargs.pop("password", "TestPass123!")
        user = model_class(**kwargs)
        user.set_password(password)
        user.save()
        return user
