import pytest
from django.urls import reverse
from rest_framework import status

from apps.accounts.factories import UserFactory
from apps.notifications.models import Notification


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _create_notification(recipient, **kwargs):
    """Shortcut to create a Notification in the database."""
    defaults = {
        "notification_type": "info",
        "title": "Test Notification",
        "message": "This is a test notification.",
        "is_read": False,
    }
    defaults.update(kwargs)
    return Notification.objects.create(recipient=recipient, **defaults)


# ---------------------------------------------------------------------------
# List Notifications
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestListNotifications:
    url = reverse("notification-list")

    def test_authenticated_user_sees_own_notifications(self, auth_client, regular_user):
        """User sees only their own notifications."""
        _create_notification(regular_user)
        _create_notification(regular_user)
        other_user = UserFactory()
        _create_notification(other_user)

        client = auth_client(regular_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        results = data.get("results", data) if isinstance(data, dict) else data
        assert len(results) == 2

    def test_unauthenticated_cannot_list(self, api_client):
        """Unauthenticated user cannot list notifications."""
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_empty_list(self, auth_client, regular_user):
        """User with no notifications gets an empty list."""
        client = auth_client(regular_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK


# ---------------------------------------------------------------------------
# Retrieve Notification
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestRetrieveNotification:

    def test_can_retrieve_own_notification(self, auth_client, regular_user):
        """User can retrieve their own notification."""
        notif = _create_notification(regular_user)
        url = reverse("notification-detail", kwargs={"pk": str(notif.pk)})
        client = auth_client(regular_user)
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_cannot_retrieve_others_notification(self, auth_client):
        """User cannot retrieve another user's notification."""
        owner = UserFactory()
        notif = _create_notification(owner)
        other_user = UserFactory()
        url = reverse("notification-detail", kwargs={"pk": str(notif.pk)})
        client = auth_client(other_user)
        response = client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND


# ---------------------------------------------------------------------------
# Mark as Read
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestMarkRead:

    def test_mark_notification_read(self, auth_client, regular_user):
        """Marking a notification as read sets is_read=True and read_at."""
        notif = _create_notification(regular_user)
        url = reverse("notification-read", kwargs={"pk": str(notif.pk)})
        client = auth_client(regular_user)
        response = client.post(url, format="json")
        assert response.status_code == status.HTTP_200_OK
        notif.refresh_from_db()
        assert notif.is_read is True
        assert notif.read_at is not None

    def test_mark_already_read(self, auth_client, regular_user):
        """Marking an already-read notification is idempotent."""
        notif = _create_notification(regular_user, is_read=True)
        url = reverse("notification-read", kwargs={"pk": str(notif.pk)})
        client = auth_client(regular_user)
        response = client.post(url, format="json")
        assert response.status_code == status.HTTP_200_OK

    def test_unauthenticated_cannot_mark_read(self, api_client, regular_user):
        """Unauthenticated user cannot mark a notification as read."""
        notif = _create_notification(regular_user)
        url = reverse("notification-read", kwargs={"pk": str(notif.pk)})
        response = api_client.post(url, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# Mark All Read
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestMarkAllRead:
    url = reverse("notification-mark-all-read")

    def test_mark_all_read(self, auth_client, regular_user):
        """Marks all unread notifications for the user as read."""
        _create_notification(regular_user)
        _create_notification(regular_user)
        _create_notification(regular_user, is_read=True)

        client = auth_client(regular_user)
        response = client.post(self.url, format="json")
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        assert data["marked_read"] == 2

        assert Notification.objects.filter(
            recipient=regular_user, is_read=False
        ).count() == 0

    def test_mark_all_read_no_unread(self, auth_client, regular_user):
        """When there are no unread notifications, marked_read is 0."""
        _create_notification(regular_user, is_read=True)
        client = auth_client(regular_user)
        response = client.post(self.url, format="json")
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        assert data["marked_read"] == 0

    def test_unauthenticated_cannot_mark_all(self, api_client):
        """Unauthenticated user cannot mark all as read."""
        response = api_client.post(self.url, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# Unread Count
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestUnreadCount:
    url = reverse("notification-unread-count")

    def test_unread_count(self, auth_client, regular_user):
        """Returns the correct count of unread notifications."""
        _create_notification(regular_user)
        _create_notification(regular_user)
        _create_notification(regular_user, is_read=True)

        client = auth_client(regular_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        assert data["unread_count"] == 2

    def test_unread_count_zero(self, auth_client, regular_user):
        """Zero unread when all are read."""
        _create_notification(regular_user, is_read=True)
        client = auth_client(regular_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        assert data["unread_count"] == 0

    def test_unread_count_excludes_others(self, auth_client, regular_user):
        """Unread count excludes other users' notifications."""
        _create_notification(regular_user)
        other_user = UserFactory()
        _create_notification(other_user)

        client = auth_client(regular_user)
        response = client.get(self.url)
        data = response.data.get("data", response.data)
        assert data["unread_count"] == 1

    def test_unauthenticated_cannot_get_count(self, api_client):
        """Unauthenticated user cannot get unread count."""
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# Notification Model
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestNotificationModel:

    def test_str_representation(self, regular_user):
        """Notification.__str__ shows title -> recipient."""
        notif = _create_notification(regular_user, title="Welcome!")
        result = str(notif)
        assert "Welcome!" in result

    def test_default_is_unread(self, regular_user):
        """New notifications default to is_read=False."""
        notif = _create_notification(regular_user)
        assert notif.is_read is False
        assert notif.read_at is None
