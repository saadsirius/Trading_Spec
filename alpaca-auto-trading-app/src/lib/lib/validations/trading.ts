import { z } from 'zod';

// Order validation schemas
export const CreateOrderSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  qty: z.number().positive().optional(),
  notional: z.number().positive().optional(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit', 'stop', 'stop_limit']),
  time_in_force: z.enum(['day', 'gtc', 'ioc', 'fok']).optional(),
  limit_price: z.number().positive().optional(),
  stop_price: z.number().positive().optional(),
}).refine(
  (data) => data.qty || data.notional,
  {
    message: "Either qty or notional must be provided",
    path: ["qty"],
  }
);

export const GetOrdersSchema = z.object({
  status: z.string().optional(),
  limit: z.number().positive().optional(),
});

export const GetPortfolioSchema = z.object({
  symbols: z.array(z.string()).optional(),
});

export const PredictSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  timeframe: z.string().optional(),
  lookback: z.number().positive().optional(),
});

export const BacktestSchema = z.object({
  strategy: z.string().min(1, 'Strategy is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  timeframe: z.string().min(1, 'Timeframe is required'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  initialCapital: z.number().positive(),
});

export const SubscribeNotificationSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export const RiskCheckSchema = z.object({
  symbol: z.string(),
  quantity: z.number().positive(),
  price: z.number().positive(),
  side: z.enum(['buy', 'sell']),
  accountValue: z.number().positive(),
});
