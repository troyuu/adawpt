from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import User
from apps.core.permissions import IsAdmin
from apps.notifications.services import create_notification
from apps.core.throttles import ReportThrottle
from .filters import ReportFilter
from .models import AnimalReport, ReportImage
from .serializers import (
    AssignVolunteerSerializer,
    ReportCreateSerializer,
    ReportDetailSerializer,
    ReportImageSerializer,
    ReportListSerializer,
    UpdateStatusSerializer,
)


class ReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for animal reports.

    - create: AllowAny (anonymous reporting)
    - list/retrieve/update/partial_update: IsAuthenticated
    - assign: Admin only
    - update_status: IsAuthenticated
    - track: AllowAny (lookup by tracking_id)
    """
    queryset = AnimalReport.objects.select_related(
        'reporter', 'assigned_volunteer',
    ).prefetch_related('images')
    filterset_class = ReportFilter
    search_fields = ['tracking_id', 'description', 'address', 'reporter_name']
    ordering_fields = ['created_at', 'urgency', 'status']

    def get_throttles(self):
        if self.action == 'create':
            return [ReportThrottle()]
        return super().get_throttles()

    def get_permissions(self):
        if self.action in ('create', 'track'):
            return [AllowAny()]
        if self.action == 'assign':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'list':
            return ReportListSerializer
        if self.action == 'create':
            return ReportCreateSerializer
        if self.action == 'assign':
            return AssignVolunteerSerializer
        if self.action == 'update_status':
            return UpdateStatusSerializer
        return ReportDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save()

        # Notify all admins of new report
        urgency = report.get_urgency_display() if hasattr(report, 'get_urgency_display') else report.urgency
        for admin in User.objects.filter(role='admin', is_active=True):
            create_notification(
                recipient=admin,
                notification_type='new_report',
                title=f'New Report ({urgency})',
                message=f'New {report.animal_type or "animal"} report at {report.address or "unknown location"}.',
                data={'report_id': str(report.id), 'tracking_id': report.tracking_id},
            )

        return Response(
            ReportDetailSerializer(report).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'], url_path='assign')
    def assign(self, request, pk=None):
        """Assign a user to this report. Admin only."""
        report = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        volunteer = User.objects.get(id=serializer.validated_data['volunteer_id'])
        report.assigned_volunteer = volunteer

        if report.status == AnimalReport.Status.SUBMITTED:
            report.status = AnimalReport.Status.ACKNOWLEDGED

        report.save()

        # Notify assigned user
        create_notification(
            recipient=volunteer,
            notification_type='report_assigned',
            title='Report Assigned to You',
            message=f'You have been assigned to report {report.tracking_id}.',
            data={'report_id': str(report.id), 'tracking_id': report.tracking_id},
        )

        return Response(ReportDetailSerializer(report).data)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Update the status of a report."""
        report = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        report.status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes', '')
        if notes:
            separator = '\n' if report.admin_notes else ''
            report.admin_notes += f'{separator}{notes}'

        if report.status == AnimalReport.Status.CLOSED:
            report.resolved_at = timezone.now()

        report.save()

        # Notify reporter (if logged in user) of status change
        if report.reporter:
            create_notification(
                recipient=report.reporter,
                notification_type='report_status',
                title=f'Report {report.get_status_display()}',
                message=f'Your report {report.tracking_id} status changed to {report.get_status_display().lower()}.',
                data={'report_id': str(report.id), 'tracking_id': report.tracking_id},
            )

        return Response(ReportDetailSerializer(report).data)

    @action(detail=False, methods=['get'], url_path='my-missions')
    def my_missions(self, request):
        """Return reports assigned to the current user."""
        qs = self.get_queryset().filter(assigned_volunteer=request.user)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = ReportListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ReportListSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='track/(?P<tracking_id>[A-Z0-9-]+)')
    def track(self, request, tracking_id=None):
        """Public endpoint to track a report by its tracking ID."""
        try:
            report = AnimalReport.objects.get(tracking_id=tracking_id)
        except AnimalReport.DoesNotExist:
            return Response(
                {'detail': 'Report not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ReportDetailSerializer(report)
        return Response(serializer.data)


class ReportImageViewSet(viewsets.ModelViewSet):
    """Nested viewset for report images."""
    serializer_class = ReportImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReportImage.objects.filter(report_id=self.kwargs['report_pk'])

    def perform_create(self, serializer):
        serializer.save(report_id=self.kwargs['report_pk'])
