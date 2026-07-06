import { Redis } from 'ioredis';
import env from './env.js';
import logger from '../utils/logger.js';

let redis = null;

const initRedis = () => {
  if (!env.redisUrl || !env.redisUrl.startsWith('redis://')) {
    logger.warn('Redis not configured — caching disabled');
    return null;
  }

  try {
    const client = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
      tls: env.redisUrl.includes('upstash.io') ? {} : undefined,
    });

    client.on('connect', () => logger.info('Redis connected'));
    client.on('ready', () => logger.info('Redis ready'));
    client.on('error', (err) => logger.error('Redis error:', err.message));

    return client;
  } catch (err) {
    logger.warn('Redis init failed — caching disabled:', err.message);
    return null;
  }
};

redis = initRedis();

export const getRedis = () => redis;
export default redis;
