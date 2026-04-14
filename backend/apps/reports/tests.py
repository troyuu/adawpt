import pytest
from django.urls import reverse
from rest_framework import status

from apps.accounts.factories import UserFactory
from apps.reports.factories import ReportFactory
from apps.reports.models import AnimalReport


# ---------------------------------------------------------------------------
# Report Creation (anonymous allowed)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestReportCreate:
    url = reverse("report-list")

    def _report_payload(self):
        return {
            "animal_type": "dog",
            "description": "Stray dog found near the park",
            "urgency": "medium",
            "address": "123 Main Street",
            "reporter_name": "John Doe",
            "reporter_phone": "09171234567",
            "reporter_email": "john@example.com",
        }

    def test_anonymous_can_create_report(self, api_client):
        """Unauthenticated user can create a report."""
        response = api_client.post(self.url, self._report_payload(), format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert AnimalReport.objects.count() == 1

    def test_authenticated_can_create_report(self, auth_client, regular_user):
        """Authenticated user can create a report; reporter is set."""
        client = auth_client(regular_user)
        response = client.post(self.url, self._report_payload(), format="json")
        assert response.status_code == status.HTTP_201_CREATED
        report = AnimalReport.objects.first()
        assert report.reporter == regular_user

    def test_anonymous_report_has_no_reporter(self, api_client):
        """Anonymous report has reporter=None."""
        api_client.post(self.url, self._report_payload(), format="json")
        report = AnimalReport.objects.first()
        assert report.reporter is None

    def test_report_tracking_id_generated(self, api_client):
        """A tracking_id is generated on creation."""
        response = api_client.post(self.url, self._report_payload(), format="json")
        assert response.status_code == status.HTTP_201_CREATED
        report = AnimalReport.objects.first()
        assert report.tracking_id.startswith("RPT-")
        assert len(report.tracking_id) == 13  # RPT-XXXX-XXXX

    def test_report_default_status_submitted(self, api_client):
        """New report defaults to 'submitted' status."""
        api_client.post(self.url, self._report_payload(), format="json")
        report = AnimalReport.objects.first()
        assert report.status == AnimalReport.Status.SUBMITTED

    def test_report_missing_required_fields(self, api_client):
        """Report without required fields returns 400."""
        response = api_client.post(self.url, {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ---------------------------------------------------------------------------
# Report List (authenticated only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestReportList:
    url = reverse("report-list")

    def test_unauthenticated_cannot_list_reports(self, api_client):
        """Unauthenticated user cannot list reports."""
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_regular_user_can_list_reports(self, auth_client, regular_user):
        """Any authenticated user can list reports."""
        ReportFactory.create_batch(3)
        client = auth_client(regular_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK

    def test_admin_can_list_reports(self, auth_client, admin_user):
        """Admin can list reports."""
        client = auth_client(admin_user)
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK


# ---------------------------------------------------------------------------
# Report Detail (authenticated)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestReportDetail:

    def test_user_can_retrieve_report(self, auth_client, regular_user):
        """Any authenticated user can retrieve a report."""
        report = ReportFactory()
        url = reverse("report-detail", kwargs={"pk": str(report.pk)})
        client = auth_client(regular_user)
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_unauthenticated_cannot_retrieve_report(self, api_client):
        """Unauthenticated user cannot retrieve a report by PK."""
        report = ReportFactory()
        url = reverse("report-detail", kwargs={"pk": str(report.pk)})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# Assign Volunteer (admin only)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestAssignVolunteer:

    def test_admin_can_assign_user(self, auth_client, admin_user, regular_user):
        """Admin can assign a user to a report."""
        report = ReportFactory()
        url = reverse("report-assign", kwargs={"pk": str(report.pk)})
        client = auth_client(admin_user)
        response = client.post(
            url, {"volunteer_id": str(regular_user.pk)}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        report.refresh_from_db()
        assert report.assigned_volunteer == regular_user

    def test_assign_changes_status_to_acknowledged(self, auth_client, admin_user, regular_user):
        """Assigning a user to a 'submitted' report changes its status to 'acknowledged'."""
        report = ReportFactory(status=AnimalReport.Status.SUBMITTED)
        url = reverse("report-assign", kwargs={"pk": str(report.pk)})
        client = auth_client(admin_user)
        client.post(url, {"volunteer_id": str(regular_user.pk)}, format="json")
        report.refresh_from_db()
        assert report.status == AnimalReport.Status.ACKNOWLEDGED

    def test_user_cannot_assign(self, auth_client, regular_user):
        """Regular user cannot assign another user."""
        report = ReportFactory()
        another_user = UserFactory()
        url = reverse("report-assign", kwargs={"pk": str(report.pk)})
        client = auth_client(regular_user)
        response = client.post(
            url, {"volunteer_id": str(another_user.pk)}, format="json"
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_assign_invalid_user(self, auth_client, admin_user):
        """Assigning a non-existent user returns 400."""
        import uuid
        report = ReportFactory()
        url = reverse("report-assign", kwargs={"pk": str(report.pk)})
        client = auth_client(admin_user)
        response = client.post(
            url, {"volunteer_id": str(uuid.uuid4())}, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ---------------------------------------------------------------------------
# Update Status (authenticated)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestUpdateStatus:

    def test_user_can_update_status(self, auth_client, regular_user):
        """Any authenticated user can update report status."""
        report = ReportFactory(status=AnimalReport.Status.ACKNOWLEDGED)
        url = reverse("report-update-status", kwargs={"pk": str(report.pk)})
        client = auth_client(regular_user)
        response = client.post(
            url, {"status": "dispatched", "notes": "On the way"}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        report.refresh_from_db()
        assert report.status == AnimalReport.Status.DISPATCHED
        assert "On the way" in report.admin_notes

    def test_admin_can_update_status(self, auth_client, admin_user):
        """Admin can update report status."""
        report = ReportFactory()
        url = reverse("report-update-status", kwargs={"pk": str(report.pk)})
        client = auth_client(admin_user)
        response = client.post(url, {"status": "rescued"}, format="json")
        assert response.status_code == status.HTTP_200_OK

    def test_close_report_sets_resolved_at(self, auth_client, admin_user):
        """Closing a report sets the resolved_at timestamp."""
        report = ReportFactory(status=AnimalReport.Status.RESCUED)
        url = reverse("report-update-status", kwargs={"pk": str(report.pk)})
        client = auth_client(admin_user)
        client.post(url, {"status": "closed"}, format="json")
        report.refresh_from_db()
        assert report.status == AnimalReport.Status.CLOSED
        assert report.resolved_at is not None

    def test_unauthenticated_cannot_update_status(self, api_client):
        """Unauthenticated user cannot update report status."""
        report = ReportFactory()
        url = reverse("report-update-status", kwargs={"pk": str(report.pk)})
        response = api_client.post(url, {"status": "rescued"}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# Track Report by tracking_id (public)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestTrackReport:

    def test_track_report_public(self, api_client):
        """Anyone can track a report by its tracking_id."""
        report = ReportFactory()
        url = f"/api/v1/reports/track/{report.tracking_id}/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_track_report_not_found(self, api_client):
        """Tracking a nonexistent tracking_id returns 404."""
        url = "/api/v1/reports/track/RPT-XXXX-YYYY/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_track_report_returns_detail(self, api_client):
        """Tracking returns report detail data including tracking_id."""
        report = ReportFactory()
        url = f"/api/v1/reports/track/{report.tracking_id}/"
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        data = response.data.get("data", response.data)
        assert data["tracking_id"] == report.tracking_id


# ---------------------------------------------------------------------------
# Report Model
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestReportModel:

    def test_str_representation(self):
        """AnimalReport.__str__ includes tracking_id and animal type."""
        report = ReportFactory(animal_type="cat")
        assert report.tracking_id in str(report)
        assert "Cat" in str(report)

    def test_tracking_id_unique(self):
        """Each report gets a unique tracking_id."""
        reports = ReportFactory.create_batch(10)
        tracking_ids = [r.tracking_id for r in reports]
        assert len(tracking_ids) == len(set(tracking_ids))
