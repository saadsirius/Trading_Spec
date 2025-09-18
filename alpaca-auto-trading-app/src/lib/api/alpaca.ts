import 'server-only';
import { z } from 'zod';

const API_KEY = process.env.APCA_API_KEY_ID!;
const API_SECRET = process.env.APCA_API_SECRET_KEY!;
const TRADING_BASE = process.env.APCA_PAPER_BASE_URL ?? 'https://paper-api.alpaca.markets/v2';
const MARKET_BASE = process.env.APCA_MARKET_DATA_URL ?? 'https://data.alpaca.markets';

if (!API_KEY || !API_SECRET) {
  throw new Error('Missing Alpaca API credentials');
}

export const AlpacaEndpoints = {
  orders: `${TRADING_BASE}/orders`,
  positions: `${TRADING_BASE}/positions`,
  account: `${TRADING_BASE}/account`,
  bars: `${MARKET_BASE}/v2/stocks/bars`,
  quotes: `${MARKET_BASE}/v2/stocks/quotes`,
  trades: `${MARKET_BASE}/v2/stocks/trades`,
} as const;

export type AlpacaHeaders = {
  'APCA-API-KEY-ID': string;
  'APCA-API-SECRET-KEY': string;
};

export const alpacaHeaders: AlpacaHeaders = {
  'APCA-API-KEY-ID': API_KEY,
  'APCA-API-SECRET-KEY': API_SECRET,
};

export async function alpacaGET(url: string, init?: RequestInit) {
  const res = await fetch(url, { 
    ...init, 
    headers: { 
      ...(init?.headers ?? {}), 
      ...alpacaHeaders 
    }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Alpaca GET ${url} failed: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function alpacaPOST(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      'content-type': 'application/json', 
      ...alpacaHeaders 
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Alpaca POST ${url} failed: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export const ZOrderRequest = z.object({
  symbol: z.string().min(1),
  qty: z.union([z.string(), z.number()]),
  side: z.enum(['buy','sell']),
  type: z.enum(['market','limit','stop','stop_limit']).default('market'),
  time_in_force: z.enum(['day','gtc','opg','cls','ioc','fok']).default('day'),
  limit_price: z.number().optional(),
  stop_price: z.number().optional(),
});

export type OrderRequest = z.infer<typeof ZOrderRequest>;

// Market data schemas
export const ZBarsRequest = z.object({
  symbols: z.string(),
  timeframe: z.enum(['1Min', '5Min', '15Min', '1Hour', '1Day']).default('1Day'),
  start: z.string().nullable().optional(),
  end: z.string().nullable().optional(),
  limit: z.number().min(1).max(10000).optional(),
  asof: z.string().nullable().optional(),
  feed: z.enum(['iex', 'sip']).default('iex'),
  page_token: z.string().nullable().optional(),
});

export const ZQuotesRequest = z.object({
  symbols: z.string(),
  feed: z.enum(['iex', 'sip']).default('iex'),
  start: z.string().nullable().optional(),
  end: z.string().nullable().optional(),
  limit: z.number().min(1).max(10000).optional(),
  page_token: z.string().nullable().optional(),
});

export const ZTradesRequest = z.object({
  symbols: z.string(),
  feed: z.enum(['iex', 'sip']).default('iex'),
  start: z.string().nullable().optional(),
  end: z.string().nullable().optional(),
  limit: z.number().min(1).max(10000).optional(),
  page_token: z.string().nullable().optional(),
});

export type BarsRequest = z.infer<typeof ZBarsRequest>;
export type QuotesRequest = z.infer<typeof ZQuotesRequest>;
export type TradesRequest = z.infer<typeof ZTradesRequest>;