from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user notifications.

    - list: Returns the authenticated user's notifications.
    - read: Marks a single notification as read.
    - mark_all_read: Marks all of the user's unread notifications as read.
    - unread_count: Returns the count of unread notifications.
    """

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['post'], url_path='read')
    def read(self, request, pk=None):
        """Mark a single notification as read."""
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=['is_read', 'read_at', 'updated_at'])
        serializer = self.get_serializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        """Mark all unread notifications for the current user as read."""
        now = timezone.now()
        updated = (
            Notification.objects
            .filter(recipient=request.user, is_read=False)
            .update(is_read=True, read_at=now, updated_at=now)
        )
        return Response(
            {'marked_read': updated},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        """Return the count of unread notifications for the current user."""
        count = (
            Notification.objects
            .filter(recipient=request.user, is_read=False)
            .count()
        )
        return Response(
            {'unread_count': count},
            status=status.HTTP_200_OK,
        )
