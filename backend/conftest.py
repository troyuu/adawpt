import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.factories import UserFactory


@pytest.fixture
def api_client():
    """Return an unauthenticated DRF APIClient."""
    return APIClient()


@pytest.fixture
def admin_user(db):
    """Return a user with admin role."""
    return UserFactory(admin=True)


@pytest.fixture
def staff_user(db):
    """Return an admin user (alias kept for existing tests)."""
    return UserFactory(admin=True)


@pytest.fixture
def regular_user(db):
    """Return a user with the default 'user' role."""
    return UserFactory()


@pytest.fixture
def auth_client():
    """
    Return a factory function that creates an APIClient authenticated
    with a JWT Bearer token for the given user.

    Usage:
        def test_something(auth_client, admin_user):
            client = auth_client(admin_user)
            response = client.get("/api/v1/some-endpoint/")
    """
    def _auth_client(user):
        client = APIClient()
        refresh = RefreshToken.for_user(user)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        return client

    return _auth_client
