import json
import logging

import redis
from django.conf import settings

from apps.notifications.models import Notification

logger = logging.getLogger(__name__)


def create_notification(recipient, notification_type, title, message, data=None, link=''):
    """
    Create a Notification record and publish it to the Redis 'notifications' channel.

    Args:
        recipient: User instance who will receive the notification.
        notification_type: A string tag categorising the notification.
        title: Human-readable title.
        message: Body text of the notification.
        data: Optional JSON-serialisable dict with extra payload.
        link: Optional frontend route to navigate to when the notification is clicked.

    Returns:
        The created Notification instance.
    """
    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        data=data,
        link=link,
    )

    # Publish to Redis for real-time delivery
    payload = {
        'user_id': str(recipient.id),
        'notification': {
            'id': str(notification.id),
            'notification_type': notification_type,
            'title': title,
            'message': message,
            'data': data,
            'link': link,
            'created_at': notification.created_at.isoformat(),
        },
    }

    try:
        r = redis.from_url(settings.REDIS_URL)
        r.publish('notifications', json.dumps(payload))
    except Exception:
        logger.exception('Failed to publish notification to Redis')

    return notification
