import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from apps.accounts.factories import UserFactory
from apps.animals.factories import AnimalFactory
from apps.content.models import Event, SuccessStory


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _create_story(author, **kwargs):
    """Create a SuccessStory via the ORM."""
    defaults = {
        "title": "A Happy Ending",
        "body": "This dog found a home.",
        "excerpt": "Happy story",
        "is_published": True,
        "is_featured": False,
    }
    defaults.update(kwargs)
    return SuccessStory.objects.create(author=author, **defaults)


def _create_event(created_by, **kwargs):
    """Create an Event via the ORM."""
    defaults = {
        "title": "Adoption Drive",
        "description": "Come adopt a pet!",
        "event_type": Event.EventType.ADOPTION_DRIVE,
        "start_date": timezone.now(),
        "is_published": True,
    }
    defaults.update(kwargs)
    return Event.objects.create(created_by=created_by, **defaults)


# ===========================================================================
# Success Stories
# ===========================================================================


# ---------------------------------------------------------------------------
# Stories List (public, published only for non-admin)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestStoryList:
    url = reverse("successstory-list")

    def test_public_sees_published_stories(self, api_client, admin_user):
        """Unauthenticated user sees only published stories."""
        _create_story(admin_user, is_published=True, title="Published Story")
        _create_story(admin_user, is_published=False, title="Draft Story")
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        results = data.get("results", data) if isinstance(data, dict) else data
        assert len(results) == 1
        assert results[0]["title"] == "Published Story"

    def test_admin_sees_all_stories(self, auth_client, admin_user):
        """Admin sees both published and draft stories."""
        _create_story(admin_user, is_published=True, title="Published")
        _create_story(admin_user, is_published=False, title="Draft")
        client = auth_client(admin_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        results = data.get("results", data) if isinstance(data, dict) else data
        assert len(results) == 2

    def test_regular_user_sees_only_published(self, auth_client, regular_user, admin_user):
        """Non-admin authenticated user sees only published stories."""
        _create_story(admin_user, is_published=True)
        _create_story(admin_user, is_published=False)
        client = auth_client(regular_user)
        response = client.get(self.url)
        data = response.data.get("data", response.data)
        results = data.get("results", data) if isinstance(data, dict) else data
        assert len(results) == 1


# ---------------------------------------------------------------------------
# Stories Retrieve (public, by slug)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestStoryRetrieve:

    def test_public_can_retrieve_published(self, api_client, admin_user):
        """Public can retrieve a published story by slug."""
        story = _create_story(admin_user, is_published=True, title="My Story")
        url = reverse("successstory-detail", kwargs={"slug": story.slug})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_public_cannot_retrieve_unpublished(self, api_client, admin_user):
        """Public cannot retrieve an unpublished story."""
        story = _create_story(admin_user, is_published=False, title="Secret Story")
        url = reverse("successstory-detail", kwargs={"slug": story.slug})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_admin_can_retrieve_unpublished(self, auth_client, admin_user):
        """Admin can retrieve an unpublished story."""
        story = _create_story(admin_user, is_published=False, title="Draft")
        url = reverse("successstory-detail", kwargs={"slug": story.slug})
        client = auth_client(admin_user)
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK


# ---------------------------------------------------------------------------
# Stories Create (admin only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestStoryCreate:
    url = reverse("successstory-list")

    def _story_payload(self):
        return {
            "title": "New Success Story",
            "body": "A wonderful adoption story.",
            "excerpt": "Great story",
            "is_published": True,
        }

    def test_admin_can_create_story(self, auth_client, admin_user):
        """Admin can create a story."""
        client = auth_client(admin_user)
        response = client.post(self.url, self._story_payload(), format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert SuccessStory.objects.filter(title="New Success Story").exists()

    def test_regular_user_cannot_create_story(self, auth_client, regular_user):
        """Regular user cannot create a story."""
        client = auth_client(regular_user)
        response = client.post(self.url, self._story_payload(), format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_create_story(self, api_client):
        """Unauthenticated user cannot create a story."""
        response = api_client.post(self.url, {}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_story_auto_slug(self, auth_client, admin_user):
        """Story slug is auto-generated from the title."""
        client = auth_client(admin_user)
        client.post(self.url, self._story_payload(), format="json")
        story = SuccessStory.objects.first()
        assert story.slug == "new-success-story"

    def test_create_story_sets_author(self, auth_client, admin_user):
        """Creating a story sets author to the authenticated user."""
        client = auth_client(admin_user)
        client.post(self.url, self._story_payload(), format="json")
        story = SuccessStory.objects.first()
        assert story.author == admin_user

    def test_create_story_with_animal(self, auth_client, admin_user):
        """Story can be linked to an animal."""
        animal = AnimalFactory()
        payload = self._story_payload()
        payload["animal"] = str(animal.pk)
        client = auth_client(admin_user)
        response = client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        story = SuccessStory.objects.first()
        assert story.animal == animal


# ---------------------------------------------------------------------------
# Stories Update (admin only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestStoryUpdate:

    def test_admin_can_update_story(self, auth_client, admin_user):
        """Admin can update a story."""
        story = _create_story(admin_user, title="Original")
        url = reverse("successstory-detail", kwargs={"slug": story.slug})
        client = auth_client(admin_user)
        response = client.patch(url, {"title": "Updated"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        story.refresh_from_db()
        assert story.title == "Updated"

    def test_regular_user_cannot_update_story(self, auth_client, regular_user, admin_user):
        """Regular user cannot update a story."""
        story = _create_story(admin_user, title="Original")
        url = reverse("successstory-detail", kwargs={"slug": story.slug})
        client = auth_client(regular_user)
        response = client.patch(url, {"title": "Hacked"}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN


# ---------------------------------------------------------------------------
# Stories Delete (admin only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestStoryDelete:

    def test_admin_can_delete_story(self, auth_client, admin_user):
        """Admin can delete a story."""
        story = _create_story(admin_user, title="To Delete")
        url = reverse("successstory-detail", kwargs={"slug": story.slug})
        client = auth_client(admin_user)
        response = client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not SuccessStory.objects.filter(pk=story.pk).exists()

    def test_regular_user_cannot_delete_story(self, auth_client, regular_user, admin_user):
        """Regular user cannot delete a story."""
        story = _create_story(admin_user, title="Protected")
        url = reverse("successstory-detail", kwargs={"slug": story.slug})
        client = auth_client(regular_user)
        response = client.delete(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN


# ===========================================================================
# Events
# ===========================================================================


# ---------------------------------------------------------------------------
# Events List (public, published only for non-admin)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestEventList:
    url = reverse("event-list")

    def test_public_sees_published_events(self, api_client, admin_user):
        """Unauthenticated user sees only published events."""
        _create_event(admin_user, is_published=True, title="Public Event")
        _create_event(admin_user, is_published=False, title="Draft Event")
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        results = data.get("results", data) if isinstance(data, dict) else data
        assert len(results) == 1

    def test_admin_sees_all_events(self, auth_client, admin_user):
        """Admin sees both published and draft events."""
        _create_event(admin_user, is_published=True, title="Published")
        _create_event(admin_user, is_published=False, title="Draft")
        client = auth_client(admin_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        results = data.get("results", data) if isinstance(data, dict) else data
        assert len(results) == 2

    def test_regular_user_sees_only_published(self, auth_client, regular_user, admin_user):
        """Non-admin authenticated user sees only published events."""
        _create_event(admin_user, is_published=True)
        _create_event(admin_user, is_published=False)
        client = auth_client(regular_user)
        response = client.get(self.url)
        data = response.data.get("data", response.data)
        results = data.get("results", data) if isinstance(data, dict) else data
        assert len(results) == 1


# ---------------------------------------------------------------------------
# Events Retrieve (public, by slug)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestEventRetrieve:

    def test_public_can_retrieve_published(self, api_client, admin_user):
        """Public can retrieve a published event by slug."""
        event = _create_event(admin_user, is_published=True, title="Open Event")
        url = reverse("event-detail", kwargs={"slug": event.slug})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_public_cannot_retrieve_unpublished(self, api_client, admin_user):
        """Public cannot retrieve an unpublished event."""
        event = _create_event(admin_user, is_published=False, title="Secret Event")
        url = reverse("event-detail", kwargs={"slug": event.slug})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND


# ---------------------------------------------------------------------------
# Events Create (admin only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestEventCreate:
    url = reverse("event-list")

    def _event_payload(self):
        return {
            "title": "New Adoption Drive",
            "description": "Come adopt a pet this weekend!",
            "event_type": "adoption_drive",
            "start_date": "2026-06-01T09:00:00Z",
            "is_published": True,
            "location": "City Park",
        }

    def test_admin_can_create_event(self, auth_client, admin_user):
        """Admin can create an event."""
        client = auth_client(admin_user)
        response = client.post(self.url, self._event_payload(), format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert Event.objects.filter(title="New Adoption Drive").exists()

    def test_regular_user_cannot_create_event(self, auth_client, regular_user):
        """Regular user cannot create an event."""
        client = auth_client(regular_user)
        response = client.post(self.url, self._event_payload(), format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_create_event(self, api_client):
        """Unauthenticated user cannot create an event."""
        response = api_client.post(self.url, {}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_event_auto_slug(self, auth_client, admin_user):
        """Event slug is auto-generated from the title."""
        client = auth_client(admin_user)
        client.post(self.url, self._event_payload(), format="json")
        event = Event.objects.first()
        assert event.slug == "new-adoption-drive"

    def test_create_event_sets_created_by(self, auth_client, admin_user):
        """Creating an event sets created_by to the authenticated user."""
        client = auth_client(admin_user)
        client.post(self.url, self._event_payload(), format="json")
        event = Event.objects.first()
        assert event.created_by == admin_user


# ---------------------------------------------------------------------------
# Events Update (admin only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestEventUpdate:

    def test_admin_can_update_event(self, auth_client, admin_user):
        """Admin can update an event."""
        event = _create_event(admin_user, title="Original Event")
        url = reverse("event-detail", kwargs={"slug": event.slug})
        client = auth_client(admin_user)
        response = client.patch(url, {"title": "Updated Event"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        event.refresh_from_db()
        assert event.title == "Updated Event"

    def test_regular_user_cannot_update_event(self, auth_client, regular_user, admin_user):
        """Regular user cannot update an event."""
        event = _create_event(admin_user, title="No Touch")
        url = reverse("event-detail", kwargs={"slug": event.slug})
        client = auth_client(regular_user)
        response = client.patch(url, {"title": "Hacked"}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN


# ---------------------------------------------------------------------------
# Events Delete (admin only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestEventDelete:

    def test_admin_can_delete_event(self, auth_client, admin_user):
        """Admin can delete an event."""
        event = _create_event(admin_user, title="To Delete")
        url = reverse("event-detail", kwargs={"slug": event.slug})
        client = auth_client(admin_user)
        response = client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Event.objects.filter(pk=event.pk).exists()

    def test_regular_user_cannot_delete_event(self, auth_client, regular_user, admin_user):
        """Regular user cannot delete an event."""
        event = _create_event(admin_user, title="Protected Event")
        url = reverse("event-detail", kwargs={"slug": event.slug})
        client = auth_client(regular_user)
        response = client.delete(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN


# ---------------------------------------------------------------------------
# Model Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestContentModels:

    def test_story_str(self, admin_user):
        """SuccessStory.__str__ returns the title."""
        story = _create_story(admin_user, title="Happy Tails")
        assert str(story) == "Happy Tails"

    def test_event_str(self, admin_user):
        """Event.__str__ returns the title."""
        event = _create_event(admin_user, title="Fundraiser 2026")
        assert str(event) == "Fundraiser 2026"

    def test_story_duplicate_slug_uniqueness(self, admin_user):
        """Duplicate titles generate unique slugs."""
        story1 = _create_story(admin_user, title="Same Title")
        story2 = _create_story(admin_user, title="Same Title")
        assert story1.slug != story2.slug
        assert story2.slug.startswith("same-title")

    def test_event_duplicate_slug_uniqueness(self, admin_user):
        """Duplicate event titles generate unique slugs."""
        event1 = _create_event(admin_user, title="Same Event")
        event2 = _create_event(admin_user, title="Same Event")
        assert event1.slug != event2.slug
        assert event2.slug.startswith("same-event")
