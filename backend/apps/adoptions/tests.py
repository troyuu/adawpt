import pytest
from django.urls import reverse
from rest_framework import status

from apps.accounts.factories import UserFactory
from apps.adoptions.factories import AdoptionApplicationFactory
from apps.adoptions.models import AdoptionApplication
from apps.animals.factories import AnimalFactory


# ---------------------------------------------------------------------------
# Create Adoption Application (any authenticated user)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestCreateAdoptionApplication:
    url = reverse("adoption-application-list")

    def _application_payload(self, animal):
        return {
            "animal": str(animal.pk),
            "housing_type": "house",
            "owns_or_rents": "owns",
            "landlord_permission": None,
            "has_yard": True,
            "other_pets": "One cat",
            "children_info": "No children",
            "pet_experience": "10 years of dog ownership",
            "work_schedule": "Remote, home all day",
            "vet_reference": "Dr. Smith, 555-0123",
            "personal_references": "Jane Doe, 555-0456",
            "reason_to_adopt": "Looking for a companion",
            "agrees_to_home_visit": True,
        }

    def test_user_can_create_application(self, auth_client, regular_user):
        """Any authenticated user can submit an adoption application."""
        animal = AnimalFactory(status="available")
        client = auth_client(regular_user)
        response = client.post(
            self.url, self._application_payload(animal), format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert AdoptionApplication.objects.filter(applicant=regular_user).exists()

    def test_unauthenticated_cannot_create(self, api_client):
        """Unauthenticated user cannot create an application."""
        animal = AnimalFactory(status="available")
        response = api_client.post(
            self.url, self._application_payload(animal), format="json"
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_duplicate_active_application_rejected(self, auth_client, regular_user):
        """User cannot create a second active application for the same animal."""
        animal = AnimalFactory(status="available")
        AdoptionApplicationFactory(applicant=regular_user, animal=animal)
        client = auth_client(regular_user)
        response = client.post(
            self.url, self._application_payload(animal), format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_can_reapply_after_withdrawal(self, auth_client, regular_user):
        """User can reapply for the same animal after withdrawing the previous application."""
        animal = AnimalFactory(status="available")
        AdoptionApplicationFactory(
            applicant=regular_user,
            animal=animal,
            status=AdoptionApplication.Status.WITHDRAWN,
        )
        client = auth_client(regular_user)
        response = client.post(
            self.url, self._application_payload(animal), format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_application_defaults_to_submitted(self, auth_client, regular_user):
        """New applications default to 'submitted' status."""
        animal = AnimalFactory(status="available")
        client = auth_client(regular_user)
        client.post(self.url, self._application_payload(animal), format="json")
        app = AdoptionApplication.objects.first()
        assert app.status == AdoptionApplication.Status.SUBMITTED

    def test_applicant_auto_set(self, auth_client, regular_user):
        """Applicant is auto-set to the authenticated user."""
        animal = AnimalFactory(status="available")
        client = auth_client(regular_user)
        client.post(self.url, self._application_payload(animal), format="json")
        app = AdoptionApplication.objects.first()
        assert app.applicant == regular_user


# ---------------------------------------------------------------------------
# List Adoption Applications (filtered by role)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestListAdoptionApplications:
    url = reverse("adoption-application-list")

    def test_admin_sees_all_applications(self, auth_client, admin_user):
        """Admin sees all applications."""
        AdoptionApplicationFactory.create_batch(3)
        client = auth_client(admin_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        results = data.get("results", data) if isinstance(data, dict) else data
        assert len(results) == 3

    def test_user_sees_only_own_applications(self, auth_client, regular_user):
        """Regular user sees only their own applications."""
        AdoptionApplicationFactory(applicant=regular_user)
        AdoptionApplicationFactory()  # from another user
        client = auth_client(regular_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        results = data.get("results", data) if isinstance(data, dict) else data
        assert len(results) == 1

    def test_unauthenticated_cannot_list(self, api_client):
        """Unauthenticated user cannot list applications."""
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# Review Application (admin only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestReviewApplication:

    def test_admin_can_approve_application(self, auth_client, admin_user):
        """Admin can approve an application."""
        application = AdoptionApplicationFactory()
        url = reverse(
            "adoption-application-review", kwargs={"pk": str(application.pk)}
        )
        client = auth_client(admin_user)
        response = client.post(
            url,
            {"status": "approved", "staff_notes": "Good candidate"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        application.refresh_from_db()
        assert application.status == AdoptionApplication.Status.APPROVED
        assert application.reviewed_by == admin_user
        assert application.reviewed_at is not None

    def test_admin_can_reject_application(self, auth_client, admin_user):
        """Admin can reject an application with a reason."""
        application = AdoptionApplicationFactory()
        url = reverse(
            "adoption-application-review", kwargs={"pk": str(application.pk)}
        )
        client = auth_client(admin_user)
        response = client.post(
            url,
            {
                "status": "rejected",
                "rejection_reason": "Insufficient experience",
                "rejection_message": "Sorry, we need someone with more experience.",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        application.refresh_from_db()
        assert application.status == AdoptionApplication.Status.REJECTED

    def test_reject_without_reason_fails(self, auth_client, admin_user):
        """Rejecting without a rejection_reason returns 400."""
        application = AdoptionApplicationFactory()
        url = reverse(
            "adoption-application-review", kwargs={"pk": str(application.pk)}
        )
        client = auth_client(admin_user)
        response = client.post(url, {"status": "rejected"}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_schedule_interview(self, auth_client, admin_user):
        """Scheduling an interview requires interview_date."""
        application = AdoptionApplicationFactory()
        url = reverse(
            "adoption-application-review", kwargs={"pk": str(application.pk)}
        )
        client = auth_client(admin_user)
        response = client.post(
            url,
            {
                "status": "interview_scheduled",
                "interview_date": "2026-05-01T10:00:00Z",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        application.refresh_from_db()
        assert application.status == AdoptionApplication.Status.INTERVIEW_SCHEDULED
        assert application.interview_date is not None

    def test_schedule_interview_without_date_fails(self, auth_client, admin_user):
        """Scheduling an interview without date returns 400."""
        application = AdoptionApplicationFactory()
        url = reverse(
            "adoption-application-review", kwargs={"pk": str(application.pk)}
        )
        client = auth_client(admin_user)
        response = client.post(
            url, {"status": "interview_scheduled"}, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_regular_user_cannot_review(self, auth_client, regular_user):
        """Regular user cannot review applications."""
        application = AdoptionApplicationFactory()
        url = reverse(
            "adoption-application-review", kwargs={"pk": str(application.pk)}
        )
        client = auth_client(regular_user)
        response = client.post(url, {"status": "approved"}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_approval_sets_animal_status(self, auth_client, admin_user):
        """Approving an application updates the animal status to adoption_pending."""
        animal = AnimalFactory(status="available")
        application = AdoptionApplicationFactory(animal=animal)
        url = reverse(
            "adoption-application-review", kwargs={"pk": str(application.pk)}
        )
        client = auth_client(admin_user)
        client.post(
            url,
            {"status": "approved", "staff_notes": "Approved!"},
            format="json",
        )
        animal.refresh_from_db()
        # The view sets it to adoption_pending, then the signal sets it to adopted
        assert animal.status in ("adoption_pending", "adopted")


# ---------------------------------------------------------------------------
# Withdraw Application (applicant only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestWithdrawApplication:

    def test_applicant_can_withdraw(self, auth_client, regular_user):
        """Applicant can withdraw their own submitted application."""
        application = AdoptionApplicationFactory(applicant=regular_user)
        url = reverse(
            "adoption-application-withdraw", kwargs={"pk": str(application.pk)}
        )
        client = auth_client(regular_user)
        response = client.post(url, format="json")
        assert response.status_code == status.HTTP_200_OK
        application.refresh_from_db()
        assert application.status == AdoptionApplication.Status.WITHDRAWN

    def test_other_user_cannot_withdraw(self, auth_client):
        """Another user cannot withdraw someone else's application."""
        application = AdoptionApplicationFactory()
        other_user = UserFactory()
        url = reverse(
            "adoption-application-withdraw", kwargs={"pk": str(application.pk)}
        )
        client = auth_client(other_user)
        response = client.post(url, format="json")
        # Returns 404 (not 403) because queryset filters to own applications only
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_cannot_withdraw_approved(self, auth_client, regular_user):
        """Cannot withdraw an already-approved application."""
        application = AdoptionApplicationFactory(
            applicant=regular_user,
            status=AdoptionApplication.Status.APPROVED,
        )
        url = reverse(
            "adoption-application-withdraw", kwargs={"pk": str(application.pk)}
        )
        client = auth_client(regular_user)
        response = client.post(url, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_cannot_withdraw_rejected(self, auth_client, regular_user):
        """Cannot withdraw an already-rejected application."""
        application = AdoptionApplicationFactory(
            applicant=regular_user,
            status=AdoptionApplication.Status.REJECTED,
        )
        url = reverse(
            "adoption-application-withdraw", kwargs={"pk": str(application.pk)}
        )
        client = auth_client(regular_user)
        response = client.post(url, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_cannot_withdraw_already_withdrawn(self, auth_client, regular_user):
        """Cannot withdraw an already-withdrawn application."""
        application = AdoptionApplicationFactory(
            applicant=regular_user,
            status=AdoptionApplication.Status.WITHDRAWN,
        )
        url = reverse(
            "adoption-application-withdraw", kwargs={"pk": str(application.pk)}
        )
        client = auth_client(regular_user)
        response = client.post(url, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_can_withdraw_under_review(self, auth_client, regular_user):
        """Can withdraw an application that is under review."""
        application = AdoptionApplicationFactory(
            applicant=regular_user,
            status=AdoptionApplication.Status.UNDER_REVIEW,
        )
        url = reverse(
            "adoption-application-withdraw", kwargs={"pk": str(application.pk)}
        )
        client = auth_client(regular_user)
        response = client.post(url, format="json")
        assert response.status_code == status.HTTP_200_OK
        application.refresh_from_db()
        assert application.status == AdoptionApplication.Status.WITHDRAWN
