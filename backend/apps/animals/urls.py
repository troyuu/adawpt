from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AnimalViewSet, AnimalImageViewSet, MedicalRecordViewSet

router = DefaultRouter()
router.register('', AnimalViewSet, basename='animal')

urlpatterns = [
    path(
        '<uuid:animal_pk>/images/',
        AnimalImageViewSet.as_view({
            'get': 'list',
            'post': 'create',
        }),
        name='animal-images-list',
    ),
    path(
        '<uuid:animal_pk>/images/<uuid:pk>/',
        AnimalImageViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy',
        }),
        name='animal-images-detail',
    ),
    path(
        '<uuid:animal_pk>/medical-records/',
        MedicalRecordViewSet.as_view({
            'get': 'list',
            'post': 'create',
        }),
        name='animal-medical-records-list',
    ),
    path(
        '<uuid:animal_pk>/medical-records/<uuid:pk>/',
        MedicalRecordViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy',
        }),
        name='animal-medical-records-detail',
    ),
    path('', include(router.urls)),
]
