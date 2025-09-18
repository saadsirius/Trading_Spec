import ky from 'ky';
import { Result, ok, err } from 'neverthrow';
import { AlpacaConfig, AlpacaAccount, AlpacaOrder, AlpacaPosition, AlpacaAsset } from './types';
import { Order, Position, Instrument } from '@/lib/core/domain';
import { AppError, toAppError } from '@/lib/errors';

// ============================================================================
// ALPACA API CLIENT
// ============================================================================

export class AlpacaClient {
  private api: typeof ky;
  private config: AlpacaConfig;

  constructor(config: AlpacaConfig) {
    this.config = config;
    this.api = ky.create({
      prefixUrl: config.baseUrl,
      headers: {
        'APCA-API-KEY-ID': config.apiKey,
        'APCA-API-SECRET-KEY': config.secretKey,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
      retry: {
        limit: 2,
        methods: ['get', 'post'],
        backoffLimit: 1000,
      },
    });
  }

  // ============================================================================
  // ACCOUNT METHODS
  // ============================================================================

  async getAccount(): Promise<Result<AlpacaAccount, AppError>> {
    try {
      const account = await this.api.get('v2/account').json<AlpacaAccount>();
      return ok(account);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  // ============================================================================
  // ORDER METHODS
  // ============================================================================

  async createOrder(orderData: {
    symbol: string;
    qty: number;
    side: 'buy' | 'sell';
    type: 'market' | 'limit' | 'stop' | 'stop_limit';
    time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
    limit_price?: number;
    stop_price?: number;
    client_order_id?: string;
  }): Promise<Result<AlpacaOrder, AppError>> {
    try {
      const order = await this.api.post('v2/orders', {
        json: orderData,
      }).json<AlpacaOrder>();
      
      return ok(order);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  async getOrders(params?: {
    status?: string;
    limit?: number;
    after?: string;
    until?: string;
    direction?: 'asc' | 'desc';
    nested?: boolean;
  }): Promise<Result<AlpacaOrder[], AppError>> {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.set(key, String(value));
          }
        });
      }

      const orders = await this.api.get('v2/orders', {
        searchParams,
      }).json<AlpacaOrder[]>();
      
      return ok(orders);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  async getOrder(orderId: string): Promise<Result<AlpacaOrder, AppError>> {
    try {
      const order = await this.api.get(`v2/orders/${orderId}`).json<AlpacaOrder>();
      return ok(order);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  async cancelOrder(orderId: string): Promise<Result<void, AppError>> {
    try {
      await this.api.delete(`v2/orders/${orderId}`);
      return ok(undefined);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  async cancelAllOrders(): Promise<Result<void, AppError>> {
    try {
      await this.api.delete('v2/orders');
      return ok(undefined);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  // ============================================================================
  // POSITION METHODS
  // ============================================================================

  async getPositions(): Promise<Result<AlpacaPosition[], AppError>> {
    try {
      const positions = await this.api.get('v2/positions').json<AlpacaPosition[]>();
      return ok(positions);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  async getPosition(symbol: string): Promise<Result<AlpacaPosition, AppError>> {
    try {
      const position = await this.api.get(`v2/positions/${symbol}`).json<AlpacaPosition>();
      return ok(position);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  async closePosition(symbol: string, qty?: number, percentage?: number): Promise<Result<AlpacaOrder, AppError>> {
    try {
      const searchParams = new URLSearchParams();
      if (qty !== undefined) searchParams.set('qty', String(qty));
      if (percentage !== undefined) searchParams.set('percentage', String(percentage));

      const order = await this.api.delete(`v2/positions/${symbol}`, {
        searchParams,
      }).json<AlpacaOrder>();
      
      return ok(order);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  async closeAllPositions(cancelOrders?: boolean): Promise<Result<AlpacaOrder[], AppError>> {
    try {
      const searchParams = new URLSearchParams();
      if (cancelOrders !== undefined) searchParams.set('cancel_orders', String(cancelOrders));

      const orders = await this.api.delete('v2/positions', {
        searchParams,
      }).json<AlpacaOrder[]>();
      
      return ok(orders);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  // ============================================================================
  // ASSET METHODS
  // ============================================================================

  async getAssets(params?: {
    status?: 'active' | 'inactive';
    asset_class?: string;
  }): Promise<Result<AlpacaAsset[], AppError>> {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.set(key, String(value));
          }
        });
      }

      const assets = await this.api.get('v2/assets', {
        searchParams,
      }).json<AlpacaAsset[]>();
      
      return ok(assets);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  async getAsset(symbol: string): Promise<Result<AlpacaAsset, AppError>> {
    try {
      const asset = await this.api.get(`v2/assets/${symbol}`).json<AlpacaAsset>();
      return ok(asset);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  // ============================================================================
  // MARKET DATA METHODS (Basic - for full market data, use separate service)
  // ============================================================================

  async getLatestQuote(symbol: string): Promise<Result<any, AppError>> {
    try {
      const quote = await this.api.get(`v2/stocks/${symbol}/quotes/latest`).json();
      return ok(quote);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  async getLatestTrade(symbol: string): Promise<Result<any, AppError>> {
    try {
      const trade = await this.api.get(`v2/stocks/${symbol}/trades/latest`).json();
      return ok(trade);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getConfig(): AlpacaConfig {
    return { ...this.config };
  }

  isPaper(): boolean {
    return this.config.paper;
  }

  updateConfig(newConfig: Partial<AlpacaConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Recreate API client with new config
    this.api = ky.create({
      prefixUrl: this.config.baseUrl,
      headers: {
        'APCA-API-KEY-ID': this.config.apiKey,
        'APCA-API-SECRET-KEY': this.config.secretKey,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
      retry: {
        limit: 2,
        methods: ['get', 'post'],
        backoffLimit: 1000,
      },
    });
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createAlpacaClient(config: AlpacaConfig): AlpacaClient {
  return new AlpacaClient(config);
}

export function createPaperClient(apiKey: string, secretKey: string): AlpacaClient {
  return new AlpacaClient({
    apiKey,
    secretKey,
    baseUrl: 'https://paper-api.alpaca.markets',
    paper: true,
  });
}

export function createLiveClient(apiKey: string, secretKey: string): AlpacaClient {
  return new AlpacaClient({
    apiKey,
    secretKey,
    baseUrl: 'https://api.alpaca.markets',
    paper: false,
  });
}
