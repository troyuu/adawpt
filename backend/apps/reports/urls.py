from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ReportImageViewSet, ReportViewSet

router = DefaultRouter()
router.register('', ReportViewSet, basename='report')

# Nested image routes: /reports/{report_pk}/images/
image_list = ReportImageViewSet.as_view({
    'get': 'list',
    'post': 'create',
})
image_detail = ReportImageViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

urlpatterns = [
    path(
        '<uuid:report_pk>/images/',
        image_list,
        name='report-image-list',
    ),
    path(
        '<uuid:report_pk>/images/<uuid:pk>/',
        image_detail,
        name='report-image-detail',
    ),
    path('', include(router.urls)),
]
