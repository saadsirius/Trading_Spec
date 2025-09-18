import { redis } from '@/lib/cache/redis';

const WINDOW = 10_000; // 10s

export async function rateLimit(
  ip: string, 
  max = Number(process.env.GATEWAY_RATE_QPS || '10')
): Promise<boolean> {
  const k = `rl:${ip}:${Math.floor(Date.now() / WINDOW)}`;
  const cur = await redis.incr(k);
  if (cur === 1) await redis.pexpire(k, WINDOW);
  return cur <= max * (WINDOW / 1000);
}
