// ============================================================================
// DOMAIN TYPES - Colonne vertébrale du système
// ============================================================================

export type UnixMs = number;
export type Symbol = string;
export type TraceId = string;

// ============================================================================
// INSTRUMENTS & MARKET DATA
// ============================================================================

export interface Instrument {
  symbol: Symbol;
  name: string;
  type: 'stock' | 'crypto' | 'forex' | 'etf' | 'option';
  exchange: string;
  currency: string;
  sector?: string;
  marketCap?: number;
  isActive: boolean;
  lastUpdated: UnixMs;
}

export interface Quote {
  symbol: Symbol;
  price: number;
  bid?: number;
  ask?: number;
  volume?: number;
  change?: number;
  changePercent?: number;
  timestamp: UnixMs;
  sourceTimestamp?: UnixMs;
  traceId?: TraceId;
}

export interface Candle {
  symbol: Symbol;
  timeframe: '1S' | '5S' | '15S' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  startTime: UnixMs;
  endTime: UnixMs;
  sourceTimestamp?: UnixMs;
  traceId?: TraceId;
}

// ============================================================================
// TRADING & ORDERS
// ============================================================================

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
export type OrderStatus = 'new' | 'partially_filled' | 'filled' | 'canceled' | 'rejected' | 'expired';
export type TimeInForce = 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';

export interface Order {
  id: string;
  clientOrderId?: string;
  symbol: Symbol;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  price?: number;
  stopPrice?: number;
  averageFillPrice?: number;
  timeInForce: TimeInForce;
  status: OrderStatus;
  mode: 'paper' | 'live';
  createdAt: UnixMs;
  updatedAt: UnixMs;
  filledAt?: UnixMs;
  canceledAt?: UnixMs;
  traceId?: TraceId;
}

export interface Position {
  id: string;
  symbol: Symbol;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  realizedPnL: number;
  marketValue: number;
  costBasis: number;
  mode: 'paper' | 'live';
  openedAt: UnixMs;
  lastUpdated: UnixMs;
  traceId?: TraceId;
}

// ============================================================================
// SIGNALS & ALERTS
// ============================================================================

export type SignalType = 'breakout' | 'pullback' | 'rsi_reentry' | 'ema_cross' | 'vol_spike' | 'sentiment_shift';
export type AlertType = 'price' | 'indicator' | 'sentiment' | 'volume' | 'news';

export interface Signal {
  id: string;
  symbol: Symbol;
  type: SignalType;
  strength: number; // 0-1
  confidence: number; // 0-1
  price: number;
  timestamp: UnixMs;
  timeframe: Candle['timeframe'];
  features: string[]; // ["EMA20>EMA50", "RSI(14)<30", "Volume>2x avg"]
  reason: string; // Explication lisible
  source: 'technical' | 'sentiment' | 'ai' | 'manual';
  actionable: boolean;
  traceId?: TraceId;
}

export interface Alert {
  id: string;
  symbol: Symbol;
  type: AlertType;
  condition: AlertCondition;
  isActive: boolean;
  triggered: boolean;
  triggeredAt?: UnixMs;
  triggeredPrice?: number;
  createdAt: UnixMs;
  expiresAt?: UnixMs;
  traceId?: TraceId;
}

export interface AlertCondition {
  operator: '>' | '<' | '>=' | '<=' | 'cross_up' | 'cross_down' | 'equals';
  value: number;
  timeframe?: Candle['timeframe'];
  indicator?: string; // 'rsi', 'ema20', 'volume', etc.
}

// ============================================================================
// SENTIMENT & NEWS
// ============================================================================

export interface SentimentSnapshot {
  symbol: Symbol;
  score: number; // -1 to +1
  confidence: number; // 0-1
  sources: {
    news: number;
    social: number;
    analyst: number;
    options: number;
  };
  timestamp: UnixMs;
  period: '1h' | '4h' | '1d' | '1w';
  trend: 'bullish' | 'bearish' | 'neutral';
  keyEvents: string[];
  traceId?: TraceId;
}

export interface NewsItem {
  id: string;
  symbol: Symbol;
  title: string;
  summary: string;
  url: string;
  source: string;
  sentiment: number; // -1 to +1
  importance: 'low' | 'medium' | 'high' | 'critical';
  publishedAt: UnixMs;
  processedAt: UnixMs;
  traceId?: TraceId;
}

// ============================================================================
// BACKTESTING & STRATEGIES
// ============================================================================

export interface Strategy {
  id: string;
  name: string;
  description: string;
  code: string; // TypeScript/DSL serialized
  paramsSchema: Record<string, any>; // Zod schema JSON
  version: string;
  isActive: boolean;
  createdAt: UnixMs;
  updatedAt: UnixMs;
  traceId?: TraceId;
}

export interface BacktestRun {
  id: string;
  strategyId: string;
  symbol: Symbol;
  timeframe: Candle['timeframe'];
  from: UnixMs;
  to: UnixMs;
  params: Record<string, any>;
  metrics: BacktestMetrics;
  trades: BacktestTrade[];
  equityCurve: EquityPoint[];
  status: 'queued' | 'running' | 'completed' | 'failed' | 'canceled';
  createdAt: UnixMs;
  completedAt?: UnixMs;
  error?: string;
  traceId?: TraceId;
}

export interface BacktestMetrics {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownDuration: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  avgTradeDuration: number;
  volatility: number;
  calmarRatio: number;
}

export interface BacktestTrade {
  id: string;
  symbol: Symbol;
  side: OrderSide;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryTime: UnixMs;
  exitTime?: UnixMs;
  pnl?: number;
  pnlPercent?: number;
  fees: number;
  slippage: number;
  reason: string; // Why this trade was taken
}

export interface EquityPoint {
  timestamp: UnixMs;
  equity: number;
  drawdown: number;
}

// ============================================================================
// SYSTEM HEALTH & MONITORING
// ============================================================================

export interface SystemHealth {
  timestamp: UnixMs;
  services: {
    alpaca: ServiceStatus;
    websocket: ServiceStatus;
    database: ServiceStatus;
    cache: ServiceStatus;
  };
  metrics: {
    latency: {
      p50: number;
      p95: number;
      p99: number;
    };
    throughput: {
      quotesPerSecond: number;
      ordersPerMinute: number;
    };
    errors: {
      total: number;
      byType: Record<string, number>;
    };
  };
  traceId?: TraceId;
}

export interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  lastCheck: UnixMs;
  error?: string;
  reconnectCount?: number;
}

// ============================================================================
// EVENT BUS TYPES
// ============================================================================

export type EventType = 
  | 'QUOTE_TICK'
  | 'CANDLE_UPDATE'
  | 'ORDER_CREATED'
  | 'ORDER_FILLED'
  | 'ORDER_CANCELED'
  | 'POSITION_OPENED'
  | 'POSITION_CLOSED'
  | 'SIGNAL_GENERATED'
  | 'ALERT_TRIGGERED'
  | 'SENTIMENT_UPDATED'
  | 'NEWS_RECEIVED'
  | 'BACKTEST_STARTED'
  | 'BACKTEST_COMPLETED'
  | 'SYSTEM_ERROR'
  | 'SYSTEM_HEALTH_UPDATE';

export interface DomainEvent {
  type: EventType;
  payload: any;
  timestamp: UnixMs;
  traceId: TraceId;
  source: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  traceId?: TraceId;
  timestamp: UnixMs;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface CacheConfig {
  ttl: number; // seconds
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'ttl';
}

// ============================================================================
// VALIDATION SCHEMAS (Zod)
// ============================================================================

import { z } from 'zod';

export const SymbolSchema = z.string().min(1).max(10);
export const UnixMsSchema = z.number().positive();
export const TraceIdSchema = z.string().uuid();

export const QuoteSchema = z.object({
  symbol: SymbolSchema,
  price: z.number().positive(),
  bid: z.number().positive().optional(),
  ask: z.number().positive().optional(),
  volume: z.number().nonnegative().optional(),
  change: z.number().optional(),
  changePercent: z.number().optional(),
  timestamp: UnixMsSchema,
  sourceTimestamp: UnixMsSchema.optional(),
  traceId: TraceIdSchema.optional(),
});

export const CandleSchema = z.object({
  symbol: SymbolSchema,
  timeframe: z.enum(['1S', '5S', '15S', '1m', '5m', '15m', '1h', '4h', '1d', '1w']),
  open: z.number().positive(),
  high: z.number().positive(),
  low: z.number().positive(),
  close: z.number().positive(),
  volume: z.number().nonnegative(),
  startTime: UnixMsSchema,
  endTime: UnixMsSchema,
  sourceTimestamp: UnixMsSchema.optional(),
  traceId: TraceIdSchema.optional(),
});

export const OrderSchema = z.object({
  id: z.string(),
  clientOrderId: z.string().optional(),
  symbol: SymbolSchema,
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit', 'stop', 'stop_limit', 'trailing_stop']),
  quantity: z.number().positive(),
  filledQuantity: z.number().nonnegative(),
  remainingQuantity: z.number().nonnegative(),
  price: z.number().positive().optional(),
  stopPrice: z.number().positive().optional(),
  averageFillPrice: z.number().positive().optional(),
  timeInForce: z.enum(['day', 'gtc', 'opg', 'cls', 'ioc', 'fok']),
  status: z.enum(['new', 'partially_filled', 'filled', 'canceled', 'rejected', 'expired']),
  mode: z.enum(['paper', 'live']),
  createdAt: UnixMsSchema,
  updatedAt: UnixMsSchema,
  filledAt: UnixMsSchema.optional(),
  canceledAt: UnixMsSchema.optional(),
  traceId: TraceIdSchema.optional(),
});
