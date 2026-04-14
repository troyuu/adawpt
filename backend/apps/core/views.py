from datetime import timedelta

from django.db.models import Count, Sum, Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([AllowAny])
def public_stats(request):
    """Public-facing stats for the landing page."""
    from apps.animals.models import Animal
    from apps.adoptions.models import AdoptionApplication
    from apps.donations.models import Donation
    from apps.accounts.models import User

    animals_rescued = Animal.objects.count()
    adopted = Animal.objects.filter(status='adopted').count()
    registered_users = User.objects.filter(is_active=True).count()
    total_donated = Donation.objects.filter(
        payment_status='completed',
    ).aggregate(total=Sum('amount'))['total'] or 0

    return Response({
        'success': True,
        'data': {
            'animals_rescued': animals_rescued,
            'adopted': adopted,
            'registered_users': registered_users,
            'total_donated': float(total_donated),
        },
        'message': 'Public stats retrieved.',
        'errors': None,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def dashboard_stats(request):
    """Admin dashboard stats."""
    from apps.animals.models import Animal
    from apps.reports.models import AnimalReport
    from apps.adoptions.models import AdoptionApplication
    from apps.donations.models import Donation

    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_animals = Animal.objects.count()
    pending_reports = AnimalReport.objects.filter(
        status__in=['submitted', 'acknowledged']
    ).count()
    active_adoptions = AdoptionApplication.objects.filter(
        status__in=['submitted', 'under_review', 'interview_scheduled']
    ).count()
    monthly_donations = Donation.objects.filter(
        created_at__gte=month_start,
        payment_status='completed',
    ).aggregate(total=Sum('amount'))['total'] or 0

    return Response({
        'success': True,
        'data': {
            'total_animals': total_animals,
            'pending_reports': pending_reports,
            'active_adoptions': active_adoptions,
            'monthly_donations': float(monthly_donations),
            'recent_activity': [],
        },
        'message': 'Dashboard stats retrieved.',
        'errors': None,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_adopter(request):
    """User dashboard stats."""
    from apps.adoptions.models import AdoptionApplication
    from apps.animals.models import Animal

    my_applications = AdoptionApplication.objects.filter(
        applicant=request.user
    ).count()
    my_adopted = Animal.objects.filter(
        adopted_by=request.user
    ).count() if hasattr(Animal, 'adopted_by') else 0

    from apps.animals.serializers import AnimalListSerializer

    recommended = Animal.objects.filter(status='available')[:6]
    recommended_data = AnimalListSerializer(
        recommended, many=True, context={'request': request}
    ).data

    return Response({
        'success': True,
        'data': {
            'my_applications': my_applications,
            'my_adopted': my_adopted,
            'recommended': recommended_data,
        },
        'message': 'User dashboard stats retrieved.',
        'errors': None,
    })
