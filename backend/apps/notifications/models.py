from django.conf import settings
from django.db import models

from apps.core.models import TimestampedModel


class Notification(TimestampedModel):
    """In-app notification sent to a user."""

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    notification_type = models.CharField(max_length=50)
    title = models.CharField(max_length=200)
    message = models.TextField()
    data = models.JSONField(null=True, blank=True)
    link = models.CharField(max_length=500, blank=True, default='')
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'notifications_notification'
        ordering = ['-created_at']
        indexes = [
            models.Index(
                fields=['recipient'],
                name='idx_notif_recipient',
            ),
            models.Index(
                fields=['recipient', 'is_read'],
                condition=models.Q(is_read=False),
                name='idx_notif_recipient_unread',
            ),
            models.Index(
                fields=['notification_type'],
                name='idx_notif_type',
            ),
            models.Index(
                fields=['-created_at'],
                name='idx_notif_created_at',
            ),
        ]

    def __str__(self):
        return f'{self.title} -> {self.recipient}'
