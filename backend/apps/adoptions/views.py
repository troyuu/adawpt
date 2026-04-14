from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import IsAdmin
from apps.notifications.services import create_notification
from .models import AdoptionApplication
from .serializers import (
    AdoptionApplicationListSerializer,
    AdoptionApplicationDetailSerializer,
    AdoptionApplicationCreateSerializer,
    ReviewApplicationSerializer,
)


class AdoptionApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for adoption applications.

    - Admins can view all applications.
    - Regular users can view only their own applications and create new ones.
    - The `review` action is restricted to admins.
    - The `withdraw` action is restricted to the application owner.
    """

    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        qs = AdoptionApplication.objects.select_related(
            'applicant', 'animal', 'reviewed_by',
        )

        if user.role == 'admin':
            return qs
        return qs.filter(applicant=user)

    def get_serializer_class(self):
        if self.action == 'list':
            return AdoptionApplicationListSerializer
        if self.action == 'create':
            return AdoptionApplicationCreateSerializer
        if self.action == 'review':
            return ReviewApplicationSerializer
        return AdoptionApplicationDetailSerializer

    def perform_create(self, serializer):
        application = serializer.save()
        animal_name = application.animal.name
        # Notify all admins
        from apps.accounts.models import User
        for admin in User.objects.filter(role='admin', is_active=True):
            create_notification(
                recipient=admin,
                notification_type='adoption_application',
                title='New Adoption Application',
                message=f'{application.applicant.full_name} applied to adopt {animal_name}.',
                data={'application_id': str(application.id), 'animal_id': str(application.animal_id)},
                link='/dashboard/adoptions',
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def review(self, request, pk=None):
        """Admin reviews an application (change status, add notes, etc.)."""
        application = self.get_object()
        serializer = ReviewApplicationSerializer(
            instance=application,
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        updated_application = serializer.save()

        # Notify applicant of status change
        status_label = updated_application.get_status_display()
        animal_name = updated_application.animal.name
        create_notification(
            recipient=updated_application.applicant,
            notification_type='adoption_status',
            title=f'Application {status_label}',
            message=f'Your adoption application for {animal_name} has been {status_label.lower()}.',
            data={'application_id': str(updated_application.id)},
            link='/dashboard/applications',
        )

        return Response(
            AdoptionApplicationDetailSerializer(updated_application).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['get'], url_path='my-applications')
    def my_applications(self, request):
        """List the current user's adoption applications."""
        qs = AdoptionApplication.objects.select_related('animal').prefetch_related('animal__images').filter(
            applicant=request.user,
        )
        ctx = {'request': request}
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = AdoptionApplicationListSerializer(page, many=True, context=ctx)
            return self.get_paginated_response(serializer.data)
        serializer = AdoptionApplicationListSerializer(qs, many=True, context=ctx)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='my-adopted')
    def my_adopted(self, request):
        """List animals adopted by the current user (approved applications)."""
        from apps.animals.serializers import AnimalListSerializer

        qs = AdoptionApplication.objects.select_related('animal').filter(
            applicant=request.user,
            status=AdoptionApplication.Status.APPROVED,
        )
        animals = [app.animal for app in qs]
        serializer = AnimalListSerializer(animals, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def withdraw(self, request, pk=None):
        """Allow the applicant to withdraw their own application."""
        application = self.get_object()

        if application.applicant != request.user:
            return Response(
                {
                    'success': False,
                    'data': None,
                    'message': 'You can only withdraw your own application.',
                    'errors': None,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if application.status in (
            AdoptionApplication.Status.REJECTED,
            AdoptionApplication.Status.WITHDRAWN,
            AdoptionApplication.Status.APPROVED,
        ):
            return Response(
                {
                    'success': False,
                    'data': None,
                    'message': f'Cannot withdraw an application with status "{application.status}".',
                    'errors': None,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        application.status = AdoptionApplication.Status.WITHDRAWN
        application.save(update_fields=['status', 'updated_at'])

        return Response(
            AdoptionApplicationDetailSerializer(application).data,
            status=status.HTTP_200_OK,
        )
