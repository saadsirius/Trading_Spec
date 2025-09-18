import type { RateLimitState } from '@/types';

const rateLimitStore = new Map<string, RateLimitState>();

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const state = rateLimitStore.get(key);

    if (!state) {
      rateLimitStore.set(key, {
        lastRequest: now,
        requestCount: 1,
        windowStart: now,
      });
      return true;
    }

    // Reset window if expired
    if (now - state.windowStart >= this.windowMs) {
      rateLimitStore.set(key, {
        lastRequest: now,
        requestCount: 1,
        windowStart: now,
      });
      return true;
    }

    // Check if under limit
    if (state.requestCount < this.maxRequests) {
      state.requestCount++;
      state.lastRequest = now;
      return true;
    }

    return false;
  }

  getTimeUntilReset(key: string): number {
    const state = rateLimitStore.get(key);
    if (!state) return 0;
    
    const now = Date.now();
    const timeSinceWindowStart = now - state.windowStart;
    return Math.max(0, this.windowMs - timeSinceWindowStart);
  }

  getRemainingRequests(key: string): number {
    const state = rateLimitStore.get(key);
    if (!state) return this.maxRequests;
    
    const now = Date.now();
    if (now - state.windowStart >= this.windowMs) {
      return this.maxRequests;
    }
    
    return Math.max(0, this.maxRequests - state.requestCount);
  }
}

// Pre-configured rate limiters
export const aiAlertRateLimit = new RateLimiter(15000, 1); // 1 alert per symbol per 15 seconds
export const globalAlertRateLimit = new RateLimiter(60000, 5); // 5 alerts total per minute
export const chartInteractionRateLimit = new RateLimiter(100, 1); // 1 crosshair update per 100ms
export const timeframeChangeRateLimit = new RateLimiter(300, 1); // 1 timeframe change per 300ms
export const orderSubmissionRateLimit = new RateLimiter(1000, 10); // 10 orders per second

export function getRateLimitKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`;
}
