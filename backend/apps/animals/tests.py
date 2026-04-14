import datetime

import pytest
from django.urls import reverse
from rest_framework import status

from apps.accounts.factories import UserFactory
from apps.animals.factories import AnimalFactory, AnimalImageFactory, MedicalRecordFactory
from apps.animals.models import Animal


# ---------------------------------------------------------------------------
# Animal List (public)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestAnimalList:
    url = reverse("animal-list")

    def test_list_animals_public(self, api_client):
        """Unauthenticated users can list animals."""
        AnimalFactory.create_batch(3)
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK

    def test_list_animals_returns_results(self, api_client):
        """Animal list returns expected count."""
        AnimalFactory.create_batch(5)
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data
        # Response is wrapped in envelope by the renderer
        results = data.get("data", data)
        if isinstance(results, dict) and "results" in results:
            assert len(results["results"]) == 5
        elif isinstance(results, list):
            assert len(results) == 5


# ---------------------------------------------------------------------------
# Animal Detail (public)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestAnimalDetail:

    def test_retrieve_animal_public(self, api_client):
        """Unauthenticated users can retrieve an animal by UUID."""
        animal = AnimalFactory()
        url = reverse("animal-detail", kwargs={"pk": str(animal.pk)})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_retrieve_animal_includes_images(self, api_client):
        """Detail endpoint includes the images array."""
        animal = AnimalFactory()
        AnimalImageFactory(animal=animal, is_primary=True)
        AnimalImageFactory(animal=animal)
        url = reverse("animal-detail", kwargs={"pk": str(animal.pk)})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        detail = response.data.get("data", response.data)
        assert "images" in detail
        assert len(detail["images"]) == 2

    def test_retrieve_animal_includes_medical_records(self, api_client):
        """Detail endpoint includes the medical_records array."""
        animal = AnimalFactory()
        MedicalRecordFactory(animal=animal)
        url = reverse("animal-detail", kwargs={"pk": str(animal.pk)})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        detail = response.data.get("data", response.data)
        assert "medical_records" in detail
        assert len(detail["medical_records"]) == 1

    def test_retrieve_nonexistent_animal(self, api_client):
        """Requesting a nonexistent UUID returns 404."""
        import uuid
        url = reverse("animal-detail", kwargs={"pk": str(uuid.uuid4())})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND


# ---------------------------------------------------------------------------
# Animal Create (admin only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestAnimalCreate:
    url = reverse("animal-list")

    def _animal_payload(self):
        return {
            "name": "Rex",
            "species": "dog",
            "breed": "Labrador",
            "age_years": 3,
            "age_months": 6,
            "gender": "male",
            "weight_kg": "25.00",
            "color": "Golden",
            "description": "Friendly dog",
            "temperament": "Playful",
            "status": "intake",
            "intake_date": str(datetime.date.today()),
            "is_spayed_neutered": False,
            "is_vaccinated": True,
        }

    def test_admin_can_create_animal(self, auth_client, admin_user):
        """Admin can create an animal."""
        client = auth_client(admin_user)
        response = client.post(self.url, self._animal_payload(), format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert Animal.objects.filter(name="Rex").exists()

    def test_regular_user_cannot_create_animal(self, auth_client, regular_user):
        """Regular user cannot create an animal."""
        client = auth_client(regular_user)
        response = client.post(self.url, self._animal_payload(), format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_create_animal(self, api_client):
        """Unauthenticated request to create an animal returns 401."""
        response = api_client.post(self.url, self._animal_payload(), format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_animal_sets_created_by(self, auth_client, admin_user):
        """Creating an animal sets created_by to the authenticated user."""
        client = auth_client(admin_user)
        client.post(self.url, self._animal_payload(), format="json")
        animal = Animal.objects.get(name="Rex")
        assert animal.created_by == admin_user


# ---------------------------------------------------------------------------
# Animal Update (admin only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestAnimalUpdate:

    def test_admin_can_update_animal(self, auth_client, admin_user):
        """Admin can update an animal's fields."""
        animal = AnimalFactory(created_by=admin_user)
        url = reverse("animal-detail", kwargs={"pk": str(animal.pk)})
        client = auth_client(admin_user)
        response = client.patch(url, {"name": "UpdatedName"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        animal.refresh_from_db()
        assert animal.name == "UpdatedName"

    def test_regular_user_cannot_update_animal(self, auth_client, regular_user):
        """Regular user cannot update an animal."""
        animal = AnimalFactory()
        url = reverse("animal-detail", kwargs={"pk": str(animal.pk)})
        client = auth_client(regular_user)
        response = client.patch(url, {"name": "Hacked"}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_update_animal(self, api_client):
        """Unauthenticated user cannot update an animal."""
        animal = AnimalFactory()
        url = reverse("animal-detail", kwargs={"pk": str(animal.pk)})
        response = api_client.patch(url, {"name": "Hacked"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# Animal Delete (admin only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestAnimalDelete:

    def test_admin_can_delete_animal(self, auth_client, admin_user):
        """Admin can delete an animal."""
        animal = AnimalFactory(created_by=admin_user)
        url = reverse("animal-detail", kwargs={"pk": str(animal.pk)})
        client = auth_client(admin_user)
        response = client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Animal.objects.filter(pk=animal.pk).exists()

    def test_regular_user_cannot_delete_animal(self, auth_client, regular_user):
        """Regular user cannot delete an animal."""
        animal = AnimalFactory()
        url = reverse("animal-detail", kwargs={"pk": str(animal.pk)})
        client = auth_client(regular_user)
        response = client.delete(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_delete_animal(self, api_client):
        """Unauthenticated user cannot delete an animal."""
        animal = AnimalFactory()
        url = reverse("animal-detail", kwargs={"pk": str(animal.pk)})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# Animal Filters
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestAnimalFilters:
    url = reverse("animal-list")

    def test_filter_by_species(self, api_client):
        """Filter animals by species."""
        AnimalFactory(species="dog")
        AnimalFactory(species="cat")
        AnimalFactory(species="cat")
        response = api_client.get(self.url, {"species": "cat"})
        assert response.status_code == status.HTTP_200_OK
        results_data = response.data.get("data", response.data)
        if isinstance(results_data, dict) and "results" in results_data:
            results = results_data["results"]
        else:
            results = results_data
        assert len(results) == 2
        assert all(r["species"] == "cat" for r in results)

    def test_filter_by_status(self, api_client):
        """Filter animals by status."""
        AnimalFactory(status="available")
        AnimalFactory(status="adopted")
        response = api_client.get(self.url, {"status": "available"})
        assert response.status_code == status.HTTP_200_OK
        results_data = response.data.get("data", response.data)
        if isinstance(results_data, dict) and "results" in results_data:
            results = results_data["results"]
        else:
            results = results_data
        assert all(r["status"] == "available" for r in results)

    def test_filter_by_gender(self, api_client):
        """Filter animals by gender."""
        AnimalFactory(gender="male")
        AnimalFactory(gender="female")
        AnimalFactory(gender="female")
        response = api_client.get(self.url, {"gender": "female"})
        assert response.status_code == status.HTTP_200_OK
        results_data = response.data.get("data", response.data)
        if isinstance(results_data, dict) and "results" in results_data:
            results = results_data["results"]
        else:
            results = results_data
        assert len(results) == 2

    def test_search_by_name(self, api_client):
        """Search animals by name using the search filter."""
        AnimalFactory(name="Buddy")
        AnimalFactory(name="Luna")
        response = api_client.get(self.url, {"search": "Buddy"})
        assert response.status_code == status.HTTP_200_OK
        results_data = response.data.get("data", response.data)
        if isinstance(results_data, dict) and "results" in results_data:
            results = results_data["results"]
        else:
            results = results_data
        assert len(results) == 1
        assert results[0]["name"] == "Buddy"

    def test_filter_is_vaccinated(self, api_client):
        """Filter animals by vaccination status."""
        AnimalFactory(is_vaccinated=True)
        AnimalFactory(is_vaccinated=False)
        AnimalFactory(is_vaccinated=True)
        response = api_client.get(self.url, {"is_vaccinated": "true"})
        assert response.status_code == status.HTTP_200_OK
        results_data = response.data.get("data", response.data)
        if isinstance(results_data, dict) and "results" in results_data:
            results = results_data["results"]
        else:
            results = results_data
        assert len(results) == 2

    def test_filter_by_breed_icontains(self, api_client):
        """Filter animals by breed (case-insensitive contains)."""
        AnimalFactory(breed="Golden Retriever")
        AnimalFactory(breed="Labrador")
        response = api_client.get(self.url, {"breed": "golden"})
        assert response.status_code == status.HTTP_200_OK
        results_data = response.data.get("data", response.data)
        if isinstance(results_data, dict) and "results" in results_data:
            results = results_data["results"]
        else:
            results = results_data
        assert len(results) == 1


# ---------------------------------------------------------------------------
# Animal Model
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestAnimalModel:

    def test_str_representation(self):
        """Animal.__str__ returns 'Name (Species Display)'."""
        animal = AnimalFactory(name="Buddy", species="dog")
        assert str(animal) == "Buddy (Dog)"

    def test_primary_image(self, api_client):
        """Primary image is returned by the list serializer."""
        animal = AnimalFactory()
        AnimalImageFactory(animal=animal, is_primary=True, order=0)
        AnimalImageFactory(animal=animal, is_primary=False, order=1)
        url = reverse("animal-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        results_data = response.data.get("data", response.data)
        if isinstance(results_data, dict) and "results" in results_data:
            results = results_data["results"]
        else:
            results = results_data
        # The first result should have a primary_image field
        first = results[0]
        assert first["primary_image"] is not None
        assert first["primary_image"]["is_primary"] is True
