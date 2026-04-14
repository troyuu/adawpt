from rest_framework import serializers

from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'notification_type',
            'title',
            'message',
            'data',
            'link',
            'is_read',
            'read_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'recipient',
            'notification_type',
            'title',
            'message',
            'data',
            'link',
            'is_read',
            'read_at',
            'created_at',
            'updated_at',
        ]
