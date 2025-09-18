import Redis from 'ioredis';

const url = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = new Redis(url, { 
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxLoadingTimeout: 5000
});

export async function cacheGet<T>(k: string): Promise<T | null> { 
  const s = await redis.get(k); 
  return s ? JSON.parse(s) as T : null; 
}

export async function cacheSet(k: string, v: any, ttlSec = 60): Promise<void> { 
  await redis.set(k, JSON.stringify(v), 'EX', ttlSec); 
}

export async function cacheDel(k: string): Promise<void> { 
  await redis.del(k); 
}
