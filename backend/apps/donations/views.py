from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import User
from apps.core.permissions import IsAdmin
from apps.donations.models import Donation
from apps.notifications.services import create_notification
from apps.donations.serializers import (
    DonationCreateSerializer,
    DonationSerializer,
    DonationSummarySerializer,
)


class DonationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing donations.

    - create: AllowAny (auto-completes payment_status to 'completed' as placeholder).
    - list: Authenticated users only (admins see all, donors see own).
    - summary: Admin-only aggregate statistics.
    """

    serializer_class = DonationSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'admin':
            return Donation.objects.select_related('donor', 'animal').all()
        if user.is_authenticated:
            return Donation.objects.select_related('donor', 'animal').filter(donor=user)
        return Donation.objects.none()

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        if self.action == 'summary':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return DonationCreateSerializer
        return DonationSerializer

    def perform_create(self, serializer):
        """Save donation, auto-completing payment_status as a placeholder."""
        kwargs = {'payment_status': Donation.PaymentStatus.COMPLETED}
        if self.request.user.is_authenticated:
            kwargs['donor'] = self.request.user
        donation = serializer.save(**kwargs)

        # Notify all admins of new donation
        donor_name = donation.donor_name or (donation.donor.full_name if donation.donor else 'Anonymous')
        for admin in User.objects.filter(role='admin', is_active=True):
            create_notification(
                recipient=admin,
                notification_type='new_donation',
                title='New Donation Received',
                message=f'{donor_name} donated ₱{donation.amount:,.2f}.',
                data={'donation_id': str(donation.id)},
            )

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Return aggregate donation statistics (admin only)."""
        now = timezone.now()
        completed = Donation.objects.filter(
            payment_status=Donation.PaymentStatus.COMPLETED,
        )

        total_raised = completed.aggregate(total=Sum('amount'))['total'] or 0
        total_donors = completed.values('donor').distinct().count()

        this_month = completed.filter(
            created_at__year=now.year,
            created_at__month=now.month,
        ).aggregate(total=Sum('amount'))['total'] or 0

        by_type_qs = (
            completed
            .values('donation_type')
            .annotate(total=Sum('amount'), count=Count('id'))
        )
        by_type = {
            entry['donation_type']: {
                'total': entry['total'],
                'count': entry['count'],
            }
            for entry in by_type_qs
        }

        data = {
            'total_raised': total_raised,
            'total_donors': total_donors,
            'this_month': this_month,
            'by_type': by_type,
        }
        serializer = DonationSummarySerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)
