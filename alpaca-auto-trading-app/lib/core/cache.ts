import { CacheConfig } from './domain';

// ============================================================================
// CACHE SYSTEM WITH TTL & CIRCUIT BREAKER
// ============================================================================

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
  threshold: number;
  timeout: number;
}

export class Cache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private circuitBreakers = new Map<string, CircuitBreakerState>();

  constructor(config: CacheConfig) {
    this.config = config;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  // ============================================================================
  // CORE CACHE METHODS
  // ============================================================================

  set(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl * 1000,
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
    this.enforceMaxSize();
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // ============================================================================
  // CIRCUIT BREAKER METHODS
  // ============================================================================

  private getCircuitBreaker(key: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, {
        failures: 0,
        lastFailureTime: 0,
        state: 'closed',
        threshold: 5, // 5 failures before opening
        timeout: 60000, // 1 minute timeout
      });
    }
    return this.circuitBreakers.get(key)!;
  }

  private updateCircuitBreaker(key: string, success: boolean): void {
    const cb = this.getCircuitBreaker(key);
    
    if (success) {
      cb.failures = 0;
      cb.state = 'closed';
    } else {
      cb.failures++;
      cb.lastFailureTime = Date.now();
      
      if (cb.failures >= cb.threshold) {
        cb.state = 'open';
      }
    }
  }

  isCircuitOpen(key: string): boolean {
    const cb = this.getCircuitBreaker(key);
    
    if (cb.state === 'open') {
      // Check if timeout has passed
      if (Date.now() - cb.lastFailureTime > cb.timeout) {
        cb.state = 'half-open';
        return false;
      }
      return true;
    }
    
    return false;
  }

  // ============================================================================
  // CACHED FUNCTION EXECUTION
  // ============================================================================

  async execute<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
    useCircuitBreaker: boolean = true
  ): Promise<T> {
    // Check circuit breaker
    if (useCircuitBreaker && this.isCircuitOpen(key)) {
      throw new Error(`Circuit breaker open for key: ${key}`);
    }

    // Try cache first
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    try {
      // Execute function
      const result = await fn();
      
      // Cache result
      this.set(key, result, ttl);
      
      // Update circuit breaker
      this.updateCircuitBreaker(key, true);
      
      return result;
    } catch (error) {
      // Update circuit breaker
      this.updateCircuitBreaker(key, false);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private enforceMaxSize(): void {
    if (this.cache.size <= this.config.maxSize) {
      return;
    }

    // Remove oldest entries based on strategy
    const entries = Array.from(this.cache.entries());
    
    switch (this.config.strategy) {
      case 'lru':
        entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        break;
      case 'fifo':
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        break;
      case 'ttl':
        entries.sort((a, b) => (a[1].timestamp + a[1].ttl) - (b[1].timestamp + b[1].ttl));
        break;
    }

    // Remove excess entries
    const toRemove = entries.slice(0, entries.length - this.config.maxSize);
    toRemove.forEach(([key]) => this.cache.delete(key));
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.cache.delete(key));
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    circuitBreakers: Record<string, CircuitBreakerState>;
  } {
    let totalAccesses = 0;
    let hits = 0;

    for (const entry of this.cache.values()) {
      totalAccesses += entry.accessCount;
      hits += entry.accessCount; // All cached entries are hits
    }

    const hitRate = totalAccesses > 0 ? hits / totalAccesses : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate,
      circuitBreakers: Object.fromEntries(this.circuitBreakers),
    };
  }
}

// ============================================================================
// SPECIALIZED CACHES
// ============================================================================

export class QuoteCache extends Cache {
  constructor() {
    super({
      ttl: 2, // 2 seconds for quotes
      maxSize: 10000,
      strategy: 'lru',
    });
  }

  setQuote(symbol: string, quote: any): void {
    this.set(`quote:${symbol}`, quote, 2000); // 2 second TTL
  }

  getQuote(symbol: string): any | null {
    return this.get(`quote:${symbol}`);
  }
}

export class NewsCache extends Cache {
  constructor() {
    super({
      ttl: 900, // 15 minutes for news
      maxSize: 1000,
      strategy: 'lru',
    });
  }

  setNews(symbol: string, news: any[]): void {
    this.set(`news:${symbol}`, news, 900000); // 15 minute TTL
  }

  getNews(symbol: string): any[] | null {
    return this.get(`news:${symbol}`);
  }
}

export class SentimentCache extends Cache {
  constructor() {
    super({
      ttl: 300, // 5 minutes for sentiment
      maxSize: 1000,
      strategy: 'lru',
    });
  }

  setSentiment(symbol: string, sentiment: any): void {
    this.set(`sentiment:${symbol}`, sentiment, 300000); // 5 minute TTL
  }

  getSentiment(symbol: string): any | null {
    return this.get(`sentiment:${symbol}`);
  }
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

export const quoteCache = new QuoteCache();
export const newsCache = new NewsCache();
export const sentimentCache = new SentimentCache();
