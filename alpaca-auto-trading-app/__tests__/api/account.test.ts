import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/account/route';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('/api/account', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.APCA_API_KEY_ID = 'test-key-id';
    process.env.APCA_API_SECRET_KEY = 'test-secret-key';
    process.env.APCA_PAPER_BASE_URL = 'https://paper-api.alpaca.markets/v2';
  });

  it('should fetch account information successfully', async () => {
    const mockAccountData = {
      id: 'test-account-id',
      account_number: '123456789',
      status: 'ACTIVE',
      currency: 'USD',
      buying_power: '10000.00',
      cash: '5000.00',
      portfolio_value: '15000.00',
      pattern_day_trader: false,
      trading_blocked: false,
      transfers_blocked: false,
      account_blocked: false,
      created_at: '2023-01-01T00:00:00Z',
      trade_suspended_by_user: false,
      multiplier: '4',
      shorting_enabled: true,
      equity: '15000.00',
      last_equity: '14500.00',
      long_market_value: '10000.00',
      short_market_value: '0.00',
      initial_margin: '4000.00',
      maintenance_margin: '3000.00',
      last_maintenance_margin: '2900.00',
      sma: '5000.00',
      daytrade_count: 0,
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockAccountData });

    const request = new NextRequest('http://localhost:3000/api/account');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockAccountData);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://paper-api.alpaca.markets/v2/account',
      {
        headers: {
          'APCA-API-KEY-ID': 'test-key-id',
          'APCA-API-SECRET-KEY': 'test-secret-key',
          'Content-Type': 'application/json',
        },
      }
    );
  });

  it('should return 500 when API keys are missing', async () => {
    delete process.env.APCA_API_KEY_ID;
    delete process.env.APCA_API_SECRET_KEY;

    const request = new NextRequest('http://localhost:3000/api/account');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Alpaca API keys not configured');
  });

  it('should handle Alpaca API errors gracefully', async () => {
    const mockError = {
      response: {
        status: 401,
        statusText: 'Unauthorized',
        data: { message: 'Invalid API credentials' },
      },
    };

    mockedAxios.get.mockRejectedValueOnce(mockError);

    const request = new NextRequest('http://localhost:3000/api/account');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch account information');
    expect(data.details).toEqual({ message: 'Invalid API credentials' });
    expect(data.status).toBe(401);
  });

  it('should handle network errors', async () => {
    const mockError = {
      request: {},
      message: 'Network Error',
    };

    mockedAxios.get.mockRejectedValueOnce(mockError);

    const request = new NextRequest('http://localhost:3000/api/account');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch account information');
    expect(data.details).toBe('Network Error');
  });

  it('should use custom paper base URL when provided', async () => {
    process.env.APCA_PAPER_BASE_URL = 'https://custom-paper-api.alpaca.markets/v2';
    
    const mockAccountData = { id: 'test-account' };
    mockedAxios.get.mockResolvedValueOnce({ data: mockAccountData });

    const request = new NextRequest('http://localhost:3000/api/account');
    await GET(request);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://custom-paper-api.alpaca.markets/v2/account',
      expect.any(Object)
    );
  });

  it('should use default paper base URL when not provided', async () => {
    delete process.env.APCA_PAPER_BASE_URL;
    
    const mockAccountData = { id: 'test-account' };
    mockedAxios.get.mockResolvedValueOnce({ data: mockAccountData });

    const request = new NextRequest('http://localhost:3000/api/account');
    await GET(request);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://paper-api.alpaca.markets/v2/account',
      expect.any(Object)
    );
  });
});


