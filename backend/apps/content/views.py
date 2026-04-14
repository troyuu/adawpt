from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.core.permissions import IsAdmin
from apps.content.models import Event, SuccessStory
from apps.content.serializers import EventSerializer, SuccessStorySerializer


class SuccessStoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for success stories.

    - list/retrieve: Public access; only published stories are shown to
      non-admin users.
    - create/update/delete: Requires IsAdmin permission.
    - Lookup by slug.
    """

    serializer_class = SuccessStorySerializer
    lookup_field = 'slug'

    def get_queryset(self):
        if self.action in ('list', 'retrieve'):
            user = self.request.user
            if user.is_authenticated and user.role == 'admin':
                return SuccessStory.objects.all()
            return SuccessStory.objects.filter(is_published=True)
        return SuccessStory.objects.all()

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for events.

    - list/retrieve: Public access; only published events are shown to
      non-admin users.
    - create/update/delete: Requires IsAdmin permission.
    - Lookup by slug.
    """

    serializer_class = EventSerializer
    lookup_field = 'pk'

    def get_queryset(self):
        if self.action in ('list', 'retrieve'):
            user = self.request.user
            if user.is_authenticated and user.role == 'admin':
                return Event.objects.all()
            return Event.objects.filter(is_published=True)
        return Event.objects.all()

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
