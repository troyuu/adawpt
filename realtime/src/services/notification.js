import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';

/**
 * Start the Redis subscription service.
 * Creates a dedicated subscriber client (ioredis requires a separate connection
 * for subscriptions) that listens on the `notifications` channel and forwards
 * each notification to the correct user room via Socket.IO.
 *
 * @param {import('socket.io').Server} io — the Socket.IO server instance
 */
export function startNotificationSubscription(io) {
  // Dedicated subscriber connection — cannot reuse the main Redis client
  const subscriber = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
  });

  subscriber.on('connect', () => {
    console.log('Redis subscriber connected');
  });

  subscriber.on('error', (err) => {
    console.error('Redis subscriber error:', err.message);
  });

  subscriber.subscribe('notifications', (err, count) => {
    if (err) {
      console.error('Failed to subscribe to notifications channel:', err.message);
      return;
    }
    console.log(`Subscribed to ${count} Redis channel(s)`);
  });

  subscriber.on('message', (channel, message) => {
    if (channel !== 'notifications') return;

    try {
      const payload = JSON.parse(message);
      const userId = payload.user_id;

      if (!userId) {
        console.warn('Notification message missing user_id, skipping');
        return;
      }

      // Emit to the user's private room
      io.to(`user:${userId}`).emit('notification', payload);
      console.log(`Notification emitted to user:${userId}`);
    } catch (err) {
      console.error('Failed to process notification message:', err.message);
    }
  });

  return subscriber;
}
