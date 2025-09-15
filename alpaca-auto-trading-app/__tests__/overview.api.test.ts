import { NextRequest } from 'next/server';
import { GET as overviewGET } from '@/app/api/overview/route';
import { GET as streamGET } from '@/app/api/overview/stream/route';
import { GET as watchlistGET, POST as watchlistPOST } from '@/app/api/watchlist/route';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    portfolioSnapshot: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    position: {
      findMany: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
    watchlistItem: {
      findMany: jest.fn(),
    },
    instrument: {
      findUnique: jest.fn(),
    },
    watchlist: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    priceBar: {
      findMany: jest.fn(),
    },
  })),
}));

// Mock environment
process.env.NODE_ENV = 'test';

describe('/api/overview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return overview data for paper mode', async () => {
    const request = new NextRequest('http://localhost:3000/api/overview?mode=paper');
    const response = await overviewGET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('mode', 'paper');
    expect(data.data).toHaveProperty('kpis');
    expect(data.data).toHaveProperty('equityCurve');
    expect(data.data).toHaveProperty('positions');
    expect(data.data).toHaveProperty('orders');
    expect(data.data).toHaveProperty('watchlist');
    expect(data.data).toHaveProperty('notifications');
  });

  it('should return overview data for live mode', async () => {
    const request = new NextRequest('http://localhost:3000/api/overview?mode=live');
    const response = await overviewGET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('mode', 'live');
  });

  it('should reject invalid mode parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/overview?mode=invalid');
    const response = await overviewGET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid mode parameter');
  });

  it('should reject missing mode parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/overview');
    const response = await overviewGET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid mode parameter');
  });

  it('should include proper headers', async () => {
    const request = new NextRequest('http://localhost:3000/api/overview?mode=paper');
    const response = await overviewGET(request);

    expect(response.headers.get('Cache-Control')).toContain('private, max-age=5');
    expect(response.headers.get('X-RateLimit-Limit')).toBe('30');
    expect(response.headers.has('X-RateLimit-Remaining')).toBe(true);
  });
});

describe('/api/overview/stream', () => {
  it('should establish SSE connection for paper mode', async () => {
    const request = new NextRequest('http://localhost:3000/api/overview/stream?mode=paper');
    const response = await streamGET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');
  });

  it('should establish SSE connection for live mode', async () => {
    const request = new NextRequest('http://localhost:3000/api/overview/stream?mode=live');
    const response = await streamGET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
  });

  it('should reject invalid mode parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/overview/stream?mode=invalid');
    const response = await streamGET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid mode parameter');
  });
});

describe('/api/watchlist', () => {
  beforeEach(() => {
    // Mock successful database operations
    const { PrismaClient } = require('@prisma/client');
    const mockPrisma = new PrismaClient();
    
    mockPrisma.watchlistItem.findMany.mockResolvedValue([]);
    mockPrisma.instrument.findUnique.mockResolvedValue({
      id: 'test-id',
      symbol: 'AAPL',
      name: 'Apple Inc.',
    });
    mockPrisma.watchlist.findFirst.mockResolvedValue({
      id: 'watchlist-id',
      userId: 'demo-user',
      isDefault: true,
    });
    mockPrisma.watchlistItem.create.mockResolvedValue({});
    mockPrisma.watchlistItem.deleteMany.mockResolvedValue({ count: 1 });
  });

  it('should return empty watchlist for new user', async () => {
    const request = new NextRequest('http://localhost:3000/api/watchlist');
    const response = await watchlistGET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.watchlist).toEqual([]);
  });

  it('should add symbol to watchlist', async () => {
    const request = new NextRequest('http://localhost:3000/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        symbol: 'AAPL',
      }),
    });

    const response = await watchlistPOST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('AAPL added to watchlist');
  });

  it('should remove symbol from watchlist', async () => {
    const request = new NextRequest('http://localhost:3000/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'remove',
        symbol: 'AAPL',
      }),
    });

    const response = await watchlistPOST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('AAPL removed from watchlist');
  });

  it('should reject invalid action', async () => {
    const request = new NextRequest('http://localhost:3000/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'invalid',
        symbol: 'AAPL',
      }),
    });

    const response = await watchlistPOST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Validation error');
  });

  it('should reject non-existent symbol', async () => {
    const { PrismaClient } = require('@prisma/client');
    const mockPrisma = new PrismaClient();
    mockPrisma.instrument.findUnique.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        symbol: 'INVALID',
      }),
    });

    const response = await watchlistPOST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Instrument not found');
  });
});
