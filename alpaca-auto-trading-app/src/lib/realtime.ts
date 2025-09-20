/**
 * File: src/lib/realtime.ts
 * Description: Real-time data and rate limiting utilities.
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
}

export class RateLimiter {
  private requests = new Map<string, number[]>();

  constructor(private config: RateLimitConfig) {}

  public checkRateLimit(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    const userRequests = this.requests.get(key) || [];
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.config.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  public getRemainingRequests(key: string): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    const userRequests = this.requests.get(key) || [];
    const validRequests = userRequests.filter(time => time > windowStart);
    
    return Math.max(0, this.config.maxRequests - validRequests.length);
  }

  public reset(key: string) {
    this.requests.delete(key);
  }
}

export const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
});

export function checkRateLimit(req: any): boolean {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  return rateLimiter.checkRateLimit(ip);
}

export function getRateLimitHeaders(req: any) {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const remaining = rateLimiter.getRemainingRequests(ip);
  
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
}