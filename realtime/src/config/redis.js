import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('Redis client connected');
});

redis.on('error', (err) => {
  console.error('Redis client error:', err.message);
});

export default redis;
