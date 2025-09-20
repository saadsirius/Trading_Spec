/**
 * File: src/lib/api/alpaca.ts
 * Description: Alpaca API client and trading functions.
 */
import { OrderRequest } from '@/lib/validation';

export interface AlpacaConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  paper: boolean;
}

export class AlpacaClient {
  private config: AlpacaConfig;

  constructor(config: AlpacaConfig) {
    this.config = config;
  }

  async getAccount() {
    const response = await fetch(`${this.config.baseUrl}/v2/account`, {
      headers: {
        'APCA-API-KEY-ID': this.config.apiKey,
        'APCA-API-SECRET-KEY': this.config.secretKey,
      },
    });
    return response.json();
  }

  async getPositions() {
    const response = await fetch(`${this.config.baseUrl}/v2/positions`, {
      headers: {
        'APCA-API-KEY-ID': this.config.apiKey,
        'APCA-API-SECRET-KEY': this.config.secretKey,
      },
    });
    return response.json();
  }

  async getOrders() {
    const response = await fetch(`${this.config.baseUrl}/v2/orders`, {
      headers: {
        'APCA-API-KEY-ID': this.config.apiKey,
        'APCA-API-SECRET-KEY': this.config.secretKey,
      },
    });
    return response.json();
  }

  async createOrder(order: OrderRequest) {
    const response = await fetch(`${this.config.baseUrl}/v2/orders`, {
      method: 'POST',
      headers: {
        'APCA-API-KEY-ID': this.config.apiKey,
        'APCA-API-SECRET-KEY': this.config.secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    return response.json();
  }

  async cancelOrder(orderId: string) {
    const response = await fetch(`${this.config.baseUrl}/v2/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'APCA-API-KEY-ID': this.config.apiKey,
        'APCA-API-SECRET-KEY': this.config.secretKey,
      },
    });
    return response.json();
  }
}

export const alpacaClient = new AlpacaClient({
  apiKey: process.env.APCA_API_KEY_ID || '',
  secretKey: process.env.APCA_API_SECRET_KEY || '',
  baseUrl: process.env.APCA_PAPER_BASE_URL || 'https://paper-api.alpaca.markets',
  paper: process.env.NODE_ENV !== 'production',
});

export async function alpacaTrade(symbol: string, quantity: number, side: 'buy' | 'sell') {
  return alpacaClient.createOrder({
    symbol,
    qty: quantity,
    side,
    type: 'market',
    time_in_force: 'day',
  });
}

export function getAlpacaService() {
  return alpacaClient;
}