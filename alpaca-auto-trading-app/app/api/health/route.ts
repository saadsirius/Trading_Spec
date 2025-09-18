import { NextRequest } from 'next/server';
import { redis } from '@/lib/cache/redis';

export async function GET(req: NextRequest) {
  const start = Date.now();
  
  try {
    // Test Redis connection
    await redis.ping();
    const redisStatus = 'ok';
    
    // Test basic functionality
    const testKey = 'health:test';
    await redis.set(testKey, 'test', 'EX', 10);
    const testValue = await redis.get(testKey);
    await redis.del(testKey);
    
    const responseTime = Date.now() - start;
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        redis: redisStatus,
        cache: testValue === 'test' ? 'ok' : 'error'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasRedis: !!process.env.REDIS_URL,
        hasAlpaca: !!(process.env.APCA_API_KEY_ID && process.env.APCA_API_SECRET_KEY),
        hasOpenAI: !!process.env.OPENAI_API_KEY
      }
    });
  } catch (error: any) {
    return Response.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        redis: 'error',
        cache: 'error'
      }
    }, { status: 500 });
  }
}
