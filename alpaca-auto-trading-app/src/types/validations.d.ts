/**
 * File: src/types/validations.d.ts
 * Description: Validation schemas and types.
 */
import { z } from 'zod';

export const PredictSchema = z.object({
  symbol: z.string().min(1),
  timeframe: z.enum(['1Min', '5Min', '15Min', '1Hour', '1Day']),
  lookback: z.number().min(1).max(1000).default(100),
});

export const SubscribeNotificationSchema = z.object({
  email: z.string().email(),
  symbols: z.array(z.string()),
  types: z.array(z.enum(['price', 'volume', 'news'])),
});

export type PredictRequest = z.infer<typeof PredictSchema>;
export type SubscribeNotificationRequest = z.infer<typeof SubscribeNotificationSchema>;
