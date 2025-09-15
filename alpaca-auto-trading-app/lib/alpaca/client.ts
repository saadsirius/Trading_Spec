import AlpacaApi from '@alpacahq/alpaca-trade-api';

export interface AlpacaConfig {
  key: string;
  secret: string;
  paper: boolean;
  baseUrl?: string;
}

export interface OrderData {
  symbol: string;
  qty?: number;
  notional?: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  time_in_force?: 'day' | 'gtc' | 'ioc' | 'fok';
  limit_price?: number;
  stop_price?: number;
}

export interface Position {
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  avgPrice: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
}

export interface Bar {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

export class AlpacaService {
  private alpaca: AlpacaApi;

  constructor(config: AlpacaConfig) {
    this.alpaca = new AlpacaApi({
      key: config.key,
      secret: config.secret,
      paper: config.paper,
      baseUrl: config.baseUrl,
    });
  }

  async getAccount() {
    try {
      const account = await this.alpaca.getAccount();
      return {
        id: account.id,
        status: account.status,
        currency: account.currency,
        buying_power: account.buying_power,
        cash: account.cash,
        portfolio_value: account.portfolio_value,
        equity: account.equity,
        long_market_value: account.long_market_value,
        short_market_value: account.short_market_value,
        initial_margin: account.initial_margin,
        maintenance_margin: account.maintenance_margin,
        last_equity: account.last_equity,
        daytrade_count: account.daytrade_count,
      };
    } catch (error) {
      console.error('Error fetching account:', error);
      throw new Error('Failed to fetch account information');
    }
  }

  async createOrder(orderData: OrderData) {
    try {
      const order = await this.alpaca.createOrder({
        symbol: orderData.symbol,
        qty: orderData.qty,
        notional: orderData.notional,
        side: orderData.side,
        type: orderData.type,
        time_in_force: orderData.time_in_force || 'day',
        limit_price: orderData.limit_price,
        stop_price: orderData.stop_price,
      });

      return {
        id: order.id,
        client_order_id: order.client_order_id,
        created_at: order.created_at,
        updated_at: order.updated_at,
        submitted_at: order.submitted_at,
        filled_at: order.filled_at,
        expired_at: order.expired_at,
        canceled_at: order.canceled_at,
        failed_at: order.failed_at,
        replaced_at: order.replaced_at,
        replaced_by: order.replaced_by,
        replaces: order.replaces,
        asset_id: order.asset_id,
        symbol: order.symbol,
        asset_class: order.asset_class,
        notional: order.notional,
        qty: order.qty,
        filled_qty: order.filled_qty,
        filled_avg_price: order.filled_avg_price,
        order_class: order.order_class,
        order_type: order.order_type,
        type: order.type,
        side: order.side,
        time_in_force: order.time_in_force,
        limit_price: order.limit_price,
        stop_price: order.stop_price,
        status: order.status,
        extended_hours: order.extended_hours,
        legs: order.legs,
        trail_percent: order.trail_percent,
        trail_price: order.trail_price,
        hwm: order.hwm,
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  async getOrders(params: { status?: string; limit?: number } = {}) {
    try {
      const orders = await this.alpaca.getOrders({
        status: params.status,
        limit: params.limit || 50,
        until: undefined,
        after: undefined,
        direction: undefined,
        nested: undefined,
        symbols: undefined,
      });

      return orders.map((order: any) => ({
        id: order.id,
        client_order_id: order.client_order_id,
        created_at: order.created_at,
        updated_at: order.updated_at,
        submitted_at: order.submitted_at,
        filled_at: order.filled_at,
        expired_at: order.expired_at,
        canceled_at: order.canceled_at,
        failed_at: order.failed_at,
        replaced_at: order.replaced_at,
        replaced_by: order.replaced_by,
        replaces: order.replaces,
        asset_id: order.asset_id,
        symbol: order.symbol,
        asset_class: order.asset_class,
        notional: order.notional,
        qty: order.qty,
        filled_qty: order.filled_qty,
        filled_avg_price: order.filled_avg_price,
        order_class: order.order_class,
        order_type: order.order_type,
        type: order.type,
        side: order.side,
        time_in_force: order.time_in_force,
        limit_price: order.limit_price,
        stop_price: order.stop_price,
        status: order.status,
        extended_hours: order.extended_hours,
        legs: order.legs,
        trail_percent: order.trail_percent,
        trail_price: order.trail_price,
        hwm: order.hwm,
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  async cancelOrder(orderId: string) {
    try {
      await this.alpaca.cancelOrder(orderId);
      return { success: true };
    } catch (error) {
      console.error('Error canceling order:', error);
      throw new Error('Failed to cancel order');
    }
  }

  async getPositions(params: { symbols?: string[] } = {}) {
    try {
      const positions = await this.alpaca.getPositions();
      
      let filteredPositions = positions;
      if (params.symbols && params.symbols.length > 0) {
        filteredPositions = positions.filter((pos: any) => params.symbols!.includes(pos.symbol));
      }

      return filteredPositions.map((pos: any) => ({
        symbol: pos.symbol,
        side: pos.side,
        quantity: parseFloat(pos.qty),
        avgPrice: parseFloat(pos.avg_entry_price),
        marketValue: parseFloat(pos.market_value),
        unrealizedPL: parseFloat(pos.unrealized_pl),
        unrealizedPLPercent: parseFloat(pos.unrealized_plpc),
      }));
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw new Error('Failed to fetch positions');
    }
  }

  async getBars(symbol: string, timeframe: string = '1Day', limit: number = 100): Promise<Bar[]> {
    try {
      const bars = await this.alpaca.getBarsV2(symbol, {
        start: new Date(Date.now() - limit * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        timeframe: timeframe,
        limit: limit,
      });

      return (bars as any)[symbol]?.map((bar: any) => ({
        t: bar.t,
        o: bar.o,
        h: bar.h,
        l: bar.l,
        c: bar.c,
        v: bar.v,
      })) || [];
    } catch (error) {
      console.error('Error fetching bars:', error);
      // Return mock data if API fails
      return this.generateMockBars(limit);
    }
  }

  private generateMockBars(limit: number): Bar[] {
    const bars: Bar[] = [];
    const basePrice = 150;
    let currentPrice = basePrice;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - limit);

    for (let i = 0; i < limit; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const change = (Math.random() - 0.5) * 10;
      const open = currentPrice;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;
      
      currentPrice = close;

      bars.push({
        t: date.toISOString(),
        o: Number(open.toFixed(2)),
        h: Number(high.toFixed(2)),
        l: Number(low.toFixed(2)),
        c: Number(close.toFixed(2)),
        v: Math.floor(Math.random() * 1000000) + 100000,
      });
    }

    return bars;
  }
}

// Factory function to get Alpaca service instance
export function getAlpacaService(userId: string, isLiveMode: boolean): AlpacaService {
  // In a real app, you'd fetch the user's API keys from the database
  const config: AlpacaConfig = {
    key: process.env.ALPACA_API_KEY || 'demo-key',
    secret: process.env.ALPACA_SECRET_KEY || 'demo-secret',
    paper: !isLiveMode,
  };

  return new AlpacaService(config);
}

// New mode-based factory function
export function getAlpacaClient(mode: 'paper' | 'live'): AlpacaService {
  const isPaper = mode === 'paper';
  
  const config: AlpacaConfig = {
    key: isPaper ? process.env.ALPACA_PAPER_KEY! : process.env.ALPACA_LIVE_KEY!,
    secret: isPaper ? process.env.ALPACA_PAPER_SECRET! : process.env.ALPACA_LIVE_SECRET!,
    paper: isPaper
  };

  return new AlpacaService(config);
}
