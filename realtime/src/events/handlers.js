import { Op } from 'sequelize';
import Notification from '../models/Notification.js';

/**
 * Register per-socket event handlers.
 *
 * @param {import('socket.io').Socket} socket
 */
export function registerEventHandlers(socket) {
  const { userId } = socket;

  /**
   * mark_read — mark a single notification as read.
   * Expects: { notification_id: string }
   */
  socket.on('mark_read', async (data, callback) => {
    try {
      const { notification_id } = data || {};
      if (!notification_id) {
        return typeof callback === 'function'
          ? callback({ error: 'notification_id is required' })
          : undefined;
      }

      const [affectedCount] = await Notification.update(
        { is_read: true, read_at: new Date() },
        {
          where: {
            id: notification_id,
            recipient_id: userId,
          },
        },
      );

      if (typeof callback === 'function') {
        callback({ success: true, updated: affectedCount });
      }
    } catch (err) {
      console.error('mark_read error:', err.message);
      if (typeof callback === 'function') {
        callback({ error: 'Failed to mark notification as read' });
      }
    }
  });

  /**
   * mark_all_read — mark every unread notification for the user as read.
   */
  socket.on('mark_all_read', async (data, callback) => {
    try {
      const [affectedCount] = await Notification.update(
        { is_read: true, read_at: new Date() },
        {
          where: {
            recipient_id: userId,
            is_read: false,
          },
        },
      );

      if (typeof callback === 'function') {
        callback({ success: true, updated: affectedCount });
      }
    } catch (err) {
      console.error('mark_all_read error:', err.message);
      if (typeof callback === 'function') {
        callback({ error: 'Failed to mark all notifications as read' });
      }
    }
  });
}
