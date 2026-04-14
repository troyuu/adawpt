import pytest
from django.urls import reverse
from rest_framework import status

from apps.accounts.factories import UserFactory
from apps.animals.factories import AnimalFactory
from apps.donations.models import Donation


# ---------------------------------------------------------------------------
# Create Donation (public)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestCreateDonation:
    url = reverse("donation-list")

    def _donation_payload(self, animal=None):
        payload = {
            "amount": "100.00",
            "donation_type": "one_time",
            "donor_name": "Generous Person",
            "donor_email": "generous@example.com",
            "message": "For the animals!",
            "is_anonymous": False,
            "is_recurring": False,
        }
        if animal:
            payload["animal"] = str(animal.pk)
        return payload

    def test_anonymous_can_donate(self, api_client):
        """Unauthenticated user can create a donation."""
        response = api_client.post(self.url, self._donation_payload(), format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert Donation.objects.count() == 1

    def test_authenticated_can_donate(self, auth_client, regular_user):
        """Authenticated user can create a donation; donor is set."""
        client = auth_client(regular_user)
        response = client.post(self.url, self._donation_payload(), format="json")
        assert response.status_code == status.HTTP_201_CREATED
        donation = Donation.objects.first()
        assert donation.donor == regular_user

    def test_anonymous_donation_no_donor(self, api_client):
        """Anonymous donation has donor=None."""
        api_client.post(self.url, self._donation_payload(), format="json")
        donation = Donation.objects.first()
        assert donation.donor is None

    def test_donation_auto_completed(self, api_client):
        """Donation payment_status is auto-set to 'completed'."""
        api_client.post(self.url, self._donation_payload(), format="json")
        donation = Donation.objects.first()
        assert donation.payment_status == Donation.PaymentStatus.COMPLETED

    def test_donation_for_specific_animal(self, api_client):
        """Donation can be linked to a specific animal."""
        animal = AnimalFactory()
        response = api_client.post(
            self.url, self._donation_payload(animal), format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
        donation = Donation.objects.first()
        assert donation.animal == animal

    def test_missing_amount_fails(self, api_client):
        """Missing amount returns 400."""
        payload = {
            "donation_type": "one_time",
            "donor_name": "Missing Amount",
        }
        response = api_client.post(self.url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ---------------------------------------------------------------------------
# List Donations (authenticated)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestListDonations:
    url = reverse("donation-list")

    def test_unauthenticated_cannot_list(self, api_client):
        """Unauthenticated user cannot list donations."""
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_admin_sees_all_donations(self, auth_client, admin_user):
        """Admin sees all donations."""
        donor1 = UserFactory()
        donor2 = UserFactory()
        Donation.objects.create(
            donor=donor1, amount=50, donation_type="one_time",
            payment_status="completed",
        )
        Donation.objects.create(
            donor=donor2, amount=100, donation_type="one_time",
            payment_status="completed",
        )
        client = auth_client(admin_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        results = data.get("results", data) if isinstance(data, dict) else data
        assert len(results) == 2

    def test_donor_sees_only_own(self, auth_client):
        """Regular authenticated user sees only their own donations."""
        donor = UserFactory()
        other_donor = UserFactory()
        Donation.objects.create(
            donor=donor, amount=50, donation_type="one_time",
            payment_status="completed",
        )
        Donation.objects.create(
            donor=other_donor, amount=100, donation_type="one_time",
            payment_status="completed",
        )
        client = auth_client(donor)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        results = data.get("results", data) if isinstance(data, dict) else data
        assert len(results) == 1


# ---------------------------------------------------------------------------
# Retrieve Donation
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestRetrieveDonation:

    def test_admin_can_retrieve_any_donation(self, auth_client, admin_user):
        """Admin can retrieve any donation."""
        donation = Donation.objects.create(
            donor=UserFactory(),
            amount=75,
            donation_type="one_time",
            payment_status="completed",
        )
        url = reverse("donation-detail", kwargs={"pk": str(donation.pk)})
        client = auth_client(admin_user)
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_donor_can_retrieve_own(self, auth_client):
        """Donor can retrieve their own donation."""
        donor = UserFactory()
        donation = Donation.objects.create(
            donor=donor, amount=75, donation_type="one_time",
            payment_status="completed",
        )
        url = reverse("donation-detail", kwargs={"pk": str(donation.pk)})
        client = auth_client(donor)
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK


# ---------------------------------------------------------------------------
# Donation Summary (admin only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestDonationSummary:
    url = reverse("donation-summary")

    def test_admin_can_view_summary(self, auth_client, admin_user):
        """Admin can access the donation summary."""
        Donation.objects.create(
            donor=admin_user, amount=100, donation_type="one_time",
            payment_status="completed",
        )
        client = auth_client(admin_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        assert "total_raised" in data
        assert "total_donors" in data
        assert "this_month" in data
        assert "by_type" in data

    def test_non_admin_cannot_view_summary(self, auth_client, regular_user):
        """Non-admin cannot access the donation summary."""
        client = auth_client(regular_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_view_summary(self, api_client):
        """Unauthenticated user cannot access the donation summary."""
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# Donation Model
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestDonationModel:

    def test_str_representation(self):
        """Donation.__str__ shows donor info and amount."""
        donor = UserFactory()
        donation = Donation.objects.create(
            donor=donor, amount=50.00, donation_type="one_time",
            payment_status="completed", donor_name="Test Donor",
        )
        result = str(donation)
        assert "Test Donor" in result
        assert "50" in result

    def test_str_anonymous_donor(self):
        """Donation.__str__ handles no donor_name and no donor."""
        donation = Donation.objects.create(
            amount=25.00, donation_type="monthly",
            payment_status="completed",
        )
        result = str(donation)
        assert "Anonymous" in result
