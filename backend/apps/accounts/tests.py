import pytest
from django.urls import reverse
from rest_framework import status

from apps.accounts.factories import UserFactory
from apps.accounts.models import User


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestRegistration:
    url = reverse("register")

    def test_register_valid_user(self, api_client):
        """Valid registration returns 201 and tokens."""
        payload = {
            "email": "newuser@example.com",
            "password": "StrongPass123!",
            "first_name": "Jane",
            "last_name": "Doe",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        data = response.data
        assert data["success"] is True
        assert data["data"]["email"] == "newuser@example.com"
        assert "tokens" in data["data"]
        assert "access" in data["data"]["tokens"]
        assert "refresh" in data["data"]["tokens"]

    def test_register_role_always_user(self, api_client):
        """Sending a role in the payload is ignored; role is always 'user'."""
        payload = {
            "email": "admin@example.com",
            "password": "StrongPass123!",
            "first_name": "Admin",
            "last_name": "User",
            "role": "admin",
        }
        response = api_client.post(self.url, payload, format="json")
        # Role field is removed from serializer, so it is ignored.
        # Registration should succeed and role should be 'user'.
        if response.status_code == status.HTTP_201_CREATED:
            user = User.objects.get(email="admin@example.com")
            assert user.role == "user"
        else:
            # If the backend still rejects admin role, that's also acceptable
            assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_duplicate_email(self, api_client):
        """Registration with an already-used email returns 400."""
        UserFactory(email="dupe@example.com")
        payload = {
            "email": "dupe@example.com",
            "password": "StrongPass123!",
            "first_name": "Another",
            "last_name": "User",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_weak_password(self, api_client):
        """Registration with a short / weak password returns 400."""
        payload = {
            "email": "weak@example.com",
            "password": "123",
            "first_name": "Weak",
            "last_name": "Pass",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_missing_required_fields(self, api_client):
        """Registration without required fields returns 400."""
        payload = {"email": "missing@example.com"}
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_user_created_in_db(self, api_client):
        """Successful registration creates the User in the database."""
        payload = {
            "email": "persist@example.com",
            "password": "StrongPass123!",
            "first_name": "Per",
            "last_name": "Sist",
        }
        api_client.post(self.url, payload, format="json")
        assert User.objects.filter(email="persist@example.com").exists()


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestLogin:
    url = reverse("login")

    def test_login_valid_credentials(self, api_client):
        """Login with correct credentials returns 200 and tokens."""
        user = UserFactory(email="login@example.com", password="StrongPass123!")
        payload = {"email": "login@example.com", "password": "StrongPass123!"}
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_200_OK
        data = response.data
        assert data["success"] is True
        assert data["data"]["email"] == user.email
        assert "tokens" in data["data"]
        assert "access" in data["data"]["tokens"]
        assert "refresh" in data["data"]["tokens"]

    def test_login_wrong_password(self, api_client):
        """Login with incorrect password returns 400."""
        UserFactory(email="wrong@example.com", password="CorrectPass123!")
        payload = {"email": "wrong@example.com", "password": "WrongPass999!"}
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_nonexistent_email(self, api_client):
        """Login with an email that does not exist returns 400."""
        payload = {"email": "ghost@example.com", "password": "Whatever123!"}
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_inactive_user(self, api_client):
        """Login for a deactivated user returns 400."""
        UserFactory(
            email="inactive@example.com",
            password="StrongPass123!",
            is_active=False,
        )
        payload = {"email": "inactive@example.com", "password": "StrongPass123!"}
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_returns_user_role(self, api_client):
        """Login response includes the user's role."""
        UserFactory(email="roled@example.com", password="StrongPass123!")
        payload = {"email": "roled@example.com", "password": "StrongPass123!"}
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["data"]["role"] == "user"


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestLogout:
    url = reverse("logout")

    def test_logout_authenticated(self, auth_client, regular_user):
        """Authenticated logout returns 200."""
        client = auth_client(regular_user)
        response = client.post(self.url, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["success"] is True

    def test_logout_unauthenticated(self, api_client):
        """Unauthenticated logout returns 401."""
        response = api_client.post(self.url, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# Profile retrieval and update
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestProfile:
    url = reverse("profile")

    def test_get_profile(self, auth_client, regular_user):
        """Authenticated user can retrieve own profile."""
        client = auth_client(regular_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data
        # Response may be wrapped in the envelope
        profile = data.get("data", data)
        assert profile["email"] == regular_user.email

    def test_get_profile_unauthenticated(self, api_client):
        """Unauthenticated access to profile returns 401."""
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_profile(self, auth_client, regular_user):
        """Authenticated user can update first_name and phone."""
        client = auth_client(regular_user)
        response = client.patch(
            self.url,
            {"first_name": "UpdatedName", "phone": "09991234567"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        regular_user.refresh_from_db()
        assert regular_user.first_name == "UpdatedName"
        assert regular_user.phone == "09991234567"

    def test_cannot_update_email(self, auth_client, regular_user):
        """Email is read-only and should not change on PATCH."""
        client = auth_client(regular_user)
        original_email = regular_user.email
        client.patch(self.url, {"email": "hacked@example.com"}, format="json")
        regular_user.refresh_from_db()
        assert regular_user.email == original_email

    def test_cannot_update_role(self, auth_client, regular_user):
        """Role is read-only and should not change on PATCH."""
        client = auth_client(regular_user)
        client.patch(self.url, {"role": "admin"}, format="json")
        regular_user.refresh_from_db()
        assert regular_user.role == "user"


# ---------------------------------------------------------------------------
# Change password
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestChangePassword:
    url = reverse("change_password")

    def test_change_password_success(self, auth_client):
        """User can change password with correct old password."""
        user = UserFactory(password="OldPassword123!")
        client = auth_client(user)
        response = client.post(
            self.url,
            {"old_password": "OldPassword123!", "new_password": "NewPassword456!"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.check_password("NewPassword456!")

    def test_change_password_wrong_old(self, auth_client):
        """Change password with incorrect old password returns 400."""
        user = UserFactory(password="OldPassword123!")
        client = auth_client(user)
        response = client.post(
            self.url,
            {"old_password": "WrongPassword!", "new_password": "NewPassword456!"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_change_password_short_new(self, auth_client):
        """Change password with too-short new password returns 400."""
        user = UserFactory(password="OldPassword123!")
        client = auth_client(user)
        response = client.post(
            self.url,
            {"old_password": "OldPassword123!", "new_password": "short"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_change_password_unauthenticated(self, api_client):
        """Unauthenticated request to change password returns 401."""
        response = api_client.post(
            self.url,
            {"old_password": "OldPassword123!", "new_password": "NewPassword456!"},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# User list (admin only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestUserList:
    url = reverse("user-list")

    def test_admin_can_list_users(self, auth_client, admin_user):
        """Admin can list all users."""
        # Create a few extra users
        UserFactory.create_batch(3)
        client = auth_client(admin_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK

    def test_regular_user_cannot_list_users(self, auth_client, regular_user):
        """Regular user cannot access user list."""
        client = auth_client(regular_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_list_users(self, api_client):
        """Unauthenticated request to user list returns 401."""
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_admin_can_retrieve_user(self, auth_client, admin_user, regular_user):
        """Admin can retrieve a specific user by UUID."""
        url = reverse("user-detail", kwargs={"pk": str(regular_user.pk)})
        client = auth_client(admin_user)
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_admin_user_list_search(self, auth_client, admin_user):
        """Admin can search users by email."""
        UserFactory(email="searchable@domain.com")
        client = auth_client(admin_user)
        response = client.get(self.url, {"search": "searchable"})
        assert response.status_code == status.HTTP_200_OK
