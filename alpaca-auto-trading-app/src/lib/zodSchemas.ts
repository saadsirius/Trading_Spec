import { z } from 'zod';

// Trading schemas
export const OrderSchema = z.object({
  symbol: z.string().min(1).max(10),
  qty: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit', 'stop', 'stop_limit']).default('market'),
  time_in_force: z.enum(['day', 'gtc', 'opg', 'cls', 'ioc', 'fok']).default('day'),
  limit_price: z.number().positive().optional(),
  stop_price: z.number().positive().optional(),
  client_order_id: z.string().optional(),
});

export const PositionSchema = z.object({
  asset_id: z.string(),
  symbol: z.string(),
  exchange: z.string(),
  asset_class: z.string(),
  qty: z.string().transform(val => parseFloat(val)),
  side: z.enum(['long', 'short']),
  market_value: z.string().transform(val => parseFloat(val)),
  cost_basis: z.string().transform(val => parseFloat(val)),
  unrealized_pl: z.string().transform(val => parseFloat(val)),
  unrealized_plpc: z.string().transform(val => parseFloat(val)),
  unrealized_intraday_pl: z.string().transform(val => parseFloat(val)),
  unrealized_intraday_plpc: z.string().transform(val => parseFloat(val)),
  current_price: z.string().transform(val => parseFloat(val)),
  lastday_price: z.string().transform(val => parseFloat(val)),
  change_today: z.string().transform(val => parseFloat(val)),
});

export const AccountSchema = z.object({
  id: z.string(),
  account_number: z.string(),
  status: z.string(),
  currency: z.string(),
  buying_power: z.string().transform(val => parseFloat(val)),
  regt_buying_power: z.string().transform(val => parseFloat(val)),
  daytrading_buying_power: z.string().transform(val => parseFloat(val)),
  non_marginable_buying_power: z.string().transform(val => parseFloat(val)),
  cash: z.string().transform(val => parseFloat(val)),
  accrued_fees: z.string().transform(val => parseFloat(val)),
  pending_transfer_out: z.string().transform(val => parseFloat(val)),
  pending_transfer_in: z.string().transform(val => parseFloat(val)),
  portfolio_value: z.string().transform(val => parseFloat(val)),
  pattern_day_trader: z.boolean(),
  trading_blocked: z.boolean(),
  transfers_blocked: z.boolean(),
  account_blocked: z.boolean(),
  created_at: z.string(),
  trade_suspended_by_user: z.boolean(),
  multiplier: z.string().transform(val => parseFloat(val)),
  shorting_enabled: z.boolean(),
  equity: z.string().transform(val => parseFloat(val)),
  last_equity: z.string().transform(val => parseFloat(val)),
  long_market_value: z.string().transform(val => parseFloat(val)),
  short_market_value: z.string().transform(val => parseFloat(val)),
  initial_margin: z.string().transform(val => parseFloat(val)),
  maintenance_margin: z.string().transform(val => parseFloat(val)),
  last_maintenance_margin: z.string().transform(val => parseFloat(val)),
  sma: z.string().transform(val => parseFloat(val)),
  daytrade_count: z.number(),
});

// Market data schemas
export const BarSchema = z.object({
  t: z.string(), // timestamp
  o: z.number(), // open
  h: z.number(), // high
  l: z.number(), // low
  c: z.number(), // close
  v: z.number(), // volume
  n: z.number(), // trade count
  vw: z.number(), // volume weighted average price
});

export const QuoteSchema = z.object({
  t: z.string(), // timestamp
  ax: z.string(), // ask exchange
  ap: z.number(), // ask price
  as: z.number(), // ask size
  bx: z.string(), // bid exchange
  bp: z.number(), // bid price
  bs: z.number(), // bid size
  c: z.array(z.string()), // conditions
  z: z.string(), // tape
});

export const TradeSchema = z.object({
  t: z.string(), // timestamp
  x: z.string(), // exchange
  p: z.number(), // price
  s: z.number(), // size
  c: z.array(z.string()), // conditions
  i: z.number(), // trade id
  z: z.string(), // tape
});

// Request schemas
export const BarsRequestSchema = z.object({
  symbols: z.string().min(1),
  timeframe: z.enum(['1Min', '5Min', '15Min', '1Hour', '1Day']).default('1Day'),
  start: z.string().optional(),
  end: z.string().optional(),
  limit: z.number().min(1).max(10000).optional(),
  asof: z.string().optional(),
  feed: z.enum(['iex', 'sip']).default('iex'),
  page_token: z.string().optional(),
});

export const QuotesRequestSchema = z.object({
  symbols: z.string().min(1),
  feed: z.enum(['iex', 'sip']).default('iex'),
  start: z.string().optional(),
  end: z.string().optional(),
  limit: z.number().min(1).max(10000).optional(),
  page_token: z.string().optional(),
});

export const TradesRequestSchema = z.object({
  symbols: z.string().min(1),
  feed: z.enum(['iex', 'sip']).default('iex'),
  start: z.string().optional(),
  end: z.string().optional(),
  limit: z.number().min(1).max(10000).optional(),
  page_token: z.string().optional(),
});

// AI Alert schemas
export const AIAlertSchema = z.object({
  symbol: z.string().min(1),
  score: z.number().min(0).max(1),
  rule: z.string().min(1),
  confidence: z.number().min(0).max(1),
  timestamp: z.string(),
  message: z.string().min(1),
  actionable: z.boolean(),
});

// Chart interaction schemas
export const ChartInteractionSchema = z.object({
  action: z.enum(['crosshair', 'timeframe_change']),
  symbol: z.string().optional(),
  timeframe: z.string().optional(),
  timestamp: z.number(),
});

// Type exports
export type OrderInput = z.infer<typeof OrderSchema>;
export type PositionData = z.infer<typeof PositionSchema>;
export type AccountData = z.infer<typeof AccountSchema>;
export type BarData = z.infer<typeof BarSchema>;
export type QuoteData = z.infer<typeof QuoteSchema>;
export type TradeData = z.infer<typeof TradeSchema>;
export type BarsRequestInput = z.infer<typeof BarsRequestSchema>;
export type QuotesRequestInput = z.infer<typeof QuotesRequestSchema>;
export type TradesRequestInput = z.infer<typeof TradesRequestSchema>;
export type AIAlertData = z.infer<typeof AIAlertSchema>;
export type ChartInteractionData = z.infer<typeof ChartInteractionSchema>;
