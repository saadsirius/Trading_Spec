import { Order, Position, Quote, Candle, Instrument } from '@/lib/core/domain';

// ============================================================================
// ALPACA API TYPES
// ============================================================================

export interface AlpacaConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  paper: boolean;
}

export interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  buying_power: string;
  regt_buying_power: string;
  daytrading_buying_power: string;
  non_marginable_buying_power: string;
  cash: string;
  accrued_fees: string;
  pending_transfer_out: string;
  pending_transfer_in: string;
  portfolio_value: string;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
  trade_suspended_by_user: boolean;
  multiplier: string;
  shorting_enabled: boolean;
  equity: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  initial_margin: string;
  maintenance_margin: string;
  last_maintenance_margin: string;
  sma: string;
  daytrade_count: number;
}

export interface AlpacaOrder {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at?: string;
  expired_at?: string;
  canceled_at?: string;
  failed_at?: string;
  replaced_at?: string;
  replaced_by?: string;
  replaces?: string;
  asset_id: string;
  symbol: string;
  asset_class: string;
  notional?: string;
  qty?: string;
  filled_qty: string;
  filled_avg_price?: string;
  order_class: string;
  order_type: string;
  type: string;
  side: string;
  time_in_force: string;
  limit_price?: string;
  stop_price?: string;
  status: string;
  extended_hours: boolean;
  legs?: AlpacaOrder[];
  trail_percent?: string;
  trail_price?: string;
  hwm?: string;
}

export interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  avg_entry_price: string;
  qty: string;
  side: string;
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
}

export interface AlpacaQuote {
  t: string; // timestamp
  ax: string; // ask exchange
  ap: number; // ask price
  as: number; // ask size
  bx: string; // bid exchange
  bp: number; // bid price
  bs: number; // bid size
  c?: string[]; // conditions
  z?: string; // tape
}

export interface AlpacaBar {
  t: string; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
  n?: number; // trade count
  vw?: number; // volume weighted average price
}

export interface AlpacaAsset {
  id: string;
  class: string;
  exchange: string;
  symbol: string;
  name: string;
  status: string;
  tradable: boolean;
  marginable: boolean;
  shortable: boolean;
  easy_to_borrow: boolean;
  fractionable: boolean;
  attributes?: string[];
  min_order_size?: string;
  min_trade_increment?: string;
  price_increment?: string;
}

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

export function mapAlpacaOrderToOrder(alpacaOrder: AlpacaOrder, mode: 'paper' | 'live'): Order {
  return {
    id: alpacaOrder.id,
    clientOrderId: alpacaOrder.client_order_id,
    symbol: alpacaOrder.symbol,
    side: alpacaOrder.side as 'buy' | 'sell',
    type: alpacaOrder.type as any,
    quantity: parseFloat(alpacaOrder.qty || '0'),
    filledQuantity: parseFloat(alpacaOrder.filled_qty),
    remainingQuantity: parseFloat(alpacaOrder.qty || '0') - parseFloat(alpacaOrder.filled_qty),
    price: alpacaOrder.limit_price ? parseFloat(alpacaOrder.limit_price) : undefined,
    stopPrice: alpacaOrder.stop_price ? parseFloat(alpacaOrder.stop_price) : undefined,
    averageFillPrice: alpacaOrder.filled_avg_price ? parseFloat(alpacaOrder.filled_avg_price) : undefined,
    timeInForce: alpacaOrder.time_in_force as any,
    status: alpacaOrder.status as any,
    mode,
    createdAt: new Date(alpacaOrder.created_at).getTime(),
    updatedAt: new Date(alpacaOrder.updated_at).getTime(),
    filledAt: alpacaOrder.filled_at ? new Date(alpacaOrder.filled_at).getTime() : undefined,
    canceledAt: alpacaOrder.canceled_at ? new Date(alpacaOrder.canceled_at).getTime() : undefined,
  };
}

export function mapAlpacaPositionToPosition(alpacaPosition: AlpacaPosition, mode: 'paper' | 'live'): Position {
  return {
    id: alpacaPosition.asset_id,
    symbol: alpacaPosition.symbol,
    quantity: parseFloat(alpacaPosition.qty),
    averagePrice: parseFloat(alpacaPosition.avg_entry_price),
    currentPrice: parseFloat(alpacaPosition.current_price),
    unrealizedPnL: parseFloat(alpacaPosition.unrealized_pl),
    unrealizedPnLPercent: parseFloat(alpacaPosition.unrealized_plpc),
    realizedPnL: 0, // Not available in Alpaca position data
    marketValue: parseFloat(alpacaPosition.market_value),
    costBasis: parseFloat(alpacaPosition.cost_basis),
    mode,
    openedAt: Date.now(), // Not available in Alpaca position data
    lastUpdated: Date.now(),
  };
}

export function mapAlpacaQuoteToQuote(alpacaQuote: AlpacaQuote, symbol: string): Quote {
  const timestamp = parseInt(alpacaQuote.t);
  const askPrice = alpacaQuote.ap;
  const bidPrice = alpacaQuote.bp;
  const midPrice = (askPrice + bidPrice) / 2;

  return {
    symbol,
    price: midPrice,
    bid: bidPrice,
    ask: askPrice,
    volume: alpacaQuote.as + alpacaQuote.bs,
    timestamp,
    sourceTimestamp: timestamp,
  };
}

export function mapAlpacaBarToCandle(alpacaBar: AlpacaBar, symbol: string, timeframe: Candle['timeframe']): Candle {
  const timestamp = parseInt(alpacaBar.t);
  
  return {
    symbol,
    timeframe,
    open: alpacaBar.o,
    high: alpacaBar.h,
    low: alpacaBar.l,
    close: alpacaBar.c,
    volume: alpacaBar.v,
    startTime: timestamp,
    endTime: timestamp + getTimeframeMs(timeframe),
    sourceTimestamp: timestamp,
  };
}

export function mapAlpacaAssetToInstrument(alpacaAsset: AlpacaAsset): Instrument {
  return {
    symbol: alpacaAsset.symbol,
    name: alpacaAsset.name,
    type: alpacaAsset.class as any,
    exchange: alpacaAsset.exchange,
    currency: 'USD', // Default for US stocks
    isActive: alpacaAsset.status === 'active' && alpacaAsset.tradable,
    lastUpdated: Date.now(),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getTimeframeMs(timeframe: Candle['timeframe']): number {
  const timeframeMap: Record<Candle['timeframe'], number> = {
    '1S': 1000,
    '5S': 5000,
    '15S': 15000,
    '1m': 60000,
    '5m': 300000,
    '15m': 900000,
    '1h': 3600000,
    '4h': 14400000,
    '1d': 86400000,
    '1w': 604800000,
  };
  
  return timeframeMap[timeframe] || 60000;
}
