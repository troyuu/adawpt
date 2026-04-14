from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.content.views import EventViewSet, SuccessStoryViewSet

router = DefaultRouter()
router.register('stories', SuccessStoryViewSet, basename='successstory')
router.register('events', EventViewSet, basename='event')

urlpatterns = [
    path('', include(router.urls)),
]
