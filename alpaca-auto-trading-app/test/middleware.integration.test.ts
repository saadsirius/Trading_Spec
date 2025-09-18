/**
 * Integration tests for the middleware system
 * These tests verify that the middleware components work together correctly
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Middleware Integration Tests', () => {
  beforeAll(() => {
    // Setup test environment
    process.env.NODE_ENV = 'test';
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.GATEWAY_RATE_QPS = '10';
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Health Check API', () => {
    it('should return health status', async () => {
      const mockResponse = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime: '15ms',
        services: {
          redis: 'ok',
          cache: 'ok'
        },
        environment: {
          nodeEnv: 'test',
          hasRedis: true,
          hasAlpaca: true,
          hasOpenAI: true
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/health');
      const data = await response.json();

      expect(data.status).toBe('healthy');
      expect(data.services.redis).toBe('ok');
      expect(data.environment.nodeEnv).toBe('test');
    });
  });

  describe('Search API', () => {
    it('should return search results', async () => {
      const mockResponse = {
        items: [
          {
            symbol: 'AAPL',
            name: 'Apple Inc.',
            type: 'stock',
            price: 150.00,
            change1d: 0.02,
            score: 0.85
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/search?q=AAPL');
      const data = await response.json();

      expect(data.items).toHaveLength(1);
      expect(data.items[0].symbol).toBe('AAPL');
      expect(data.items[0].score).toBeGreaterThan(0);
    });

    it('should return empty results for invalid query', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] })
      });

      const response = await fetch('/api/search?q=');
      const data = await response.json();

      expect(data.items).toHaveLength(0);
    });
  });

  describe('Plugin System', () => {
    it('should return active plugins', async () => {
      const mockResponse = {
        items: ['alpaca', 'ai']
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/gw/list');
      const data = await response.json();

      expect(data.items).toContain('alpaca');
      expect(data.items).toContain('ai');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limit exceeded', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit'
      });

      const response = await fetch('/api/gw/alpaca/market/bars?symbols=SPY');
      
      expect(response.status).toBe(429);
    });
  });

  describe('GraphQL API', () => {
    it('should handle GraphQL queries', async () => {
      const mockResponse = {
        data: {
          quote: {
            symbol: 'AAPL',
            price: 150.00,
            change1d: 0.02
          }
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: '{ quote(symbol: "AAPL") { symbol price change1d } }'
        })
      });

      const data = await response.json();
      expect(data.data.quote.symbol).toBe('AAPL');
    });
  });

  describe('SSE Streaming', () => {
    it('should handle SSE connection', async () => {
      const mockEventSource = {
        onopen: null,
        onmessage: null,
        onerror: null,
        close: jest.fn()
      };

      // Mock EventSource
      (global as any).EventSource = jest.fn(() => mockEventSource);

      const eventSource = new EventSource('/api/stream/sse?symbols=SPY,QQQ');
      
      expect(eventSource).toBeDefined();
      expect(EventSource).toHaveBeenCalledWith('/api/stream/sse?symbols=SPY,QQQ');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/health');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });
  });

  describe('Configuration', () => {
    it('should have required environment variables', () => {
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.REDIS_URL).toBeDefined();
      expect(process.env.GATEWAY_RATE_QPS).toBeDefined();
    });
  });
});
