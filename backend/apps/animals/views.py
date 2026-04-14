from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.core.permissions import IsAdmin
from .filters import AnimalFilter
from .models import Animal, AnimalImage, MedicalRecord
from .serializers import (
    AnimalListSerializer,
    AnimalDetailSerializer,
    AnimalCreateUpdateSerializer,
    AnimalImageSerializer,
    MedicalRecordSerializer,
)


class AnimalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing animals.

    - list/retrieve: Public access (AllowAny)
    - create/update/delete: Requires IsAdmin permission
    """

    queryset = Animal.objects.prefetch_related('images').all()
    filterset_class = AnimalFilter
    search_fields = ['name', 'breed', 'description', 'color']
    ordering_fields = ['name', 'species', 'status', 'intake_date', 'created_at']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]

    def get_serializer_class(self):
        if self.action == 'list':
            return AnimalListSerializer
        if self.action == 'retrieve':
            return AnimalDetailSerializer
        return AnimalCreateUpdateSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related('medical_records')
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AnimalImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing animal images.

    Nested under animals: /animals/{animal_pk}/images/
    """

    serializer_class = AnimalImageSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]

    def get_queryset(self):
        return AnimalImage.objects.filter(animal_id=self.kwargs['animal_pk'])

    def perform_create(self, serializer):
        serializer.save(animal_id=self.kwargs['animal_pk'])


class MedicalRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing animal medical records.

    Nested under animals: /animals/{animal_pk}/medical-records/
    """

    serializer_class = MedicalRecordSerializer

    def get_permissions(self):
        return [IsAuthenticated(), IsAdmin()]

    def get_queryset(self):
        return MedicalRecord.objects.filter(animal_id=self.kwargs['animal_pk'])

    def perform_create(self, serializer):
        serializer.save(
            animal_id=self.kwargs['animal_pk'],
            created_by=self.request.user,
        )
