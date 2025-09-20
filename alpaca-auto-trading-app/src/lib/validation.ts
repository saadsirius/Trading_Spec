/**
 * File: src/lib/validation.ts
 * Description: Validation utilities and schemas.
 */
import { z } from 'zod';

export const TradingSchema = z.object({
  symbol: z.string().min(1),
  quantity: z.number().positive(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit', 'stop']),
  price: z.number().positive().optional(),
});

export const OrderSchema = z.object({
  symbol: z.string().min(1),
  qty: z.number().positive(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit', 'stop']),
  time_in_force: z.enum(['day', 'gtc', 'ioc', 'fok']).default('day'),
  limit_price: z.number().positive().optional(),
  stop_price: z.number().positive().optional(),
});

export const WatchlistSchema = z.object({
  name: z.string().min(1),
  symbols: z.array(z.string()),
  description: z.string().optional(),
});

export const AlertSchema = z.object({
  symbol: z.string().min(1),
  condition: z.enum(['price_above', 'price_below', 'volume_above', 'volume_below']),
  value: z.number(),
  message: z.string().optional(),
});

export type TradingRequest = z.infer<typeof TradingSchema>;
export type OrderRequest = z.infer<typeof OrderSchema>;
export type WatchlistRequest = z.infer<typeof WatchlistSchema>;
export type AlertRequest = z.infer<typeof AlertSchema>;
