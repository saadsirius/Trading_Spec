import { z } from 'zod';
import crypto from 'node:crypto';

export const SearchQ = z.object({ 
  q: z.string().min(1).max(64) 
});

export const StreamQ = z.object({ 
  symbols: z.string().min(1) 
});

export const AlpacaBarsQ = z.object({
  symbols: z.string().min(1),
  timeframe: z.enum(['1Min', '5Min', '15Min', '1Hour', '1Day']),
  limit: z.coerce.number().int().min(1).max(1000).default(100)
});

export function verifyHmac(raw: string, sigHeader?: string): boolean {
  const secret = process.env.SHARED_WEBHOOK_SECRET || '';
  if (!secret) return true; // no secret → permissif
  if (!sigHeader) return false;
  
  const sig = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sigHeader));
}
