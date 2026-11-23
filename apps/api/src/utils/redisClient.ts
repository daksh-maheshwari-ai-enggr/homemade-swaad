import * as Redis from 'redis';

let client: Redis.RedisClientType | null = null;

export const getRedisClient = (): Redis.RedisClientType => {
  if (!client) {
    client = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    client.on('error', (err) => console.error('Redis error:', err));
    client.connect().catch(console.error);
  }
  return client;
};

export const redis = getRedisClient();