/**
 * Colonne vertébrale des types métiers (strict, réutilisable).
 * Tout passe par ici: données marché, ordres, signaux, alertes IA, santé système.
 */
import { z } from "zod";

/** Identités de base */
export type Market = "US" | "EU" | "CRYPTO";
export type Venue = "alpaca" | "sim" | "paper";
export type Side = "buy" | "sell";
export type OrderType = "market" | "limit" | "stop" | "stop_limit";
export type TimeInForce = "day" | "gtc" | "opg" | "ioc" | "fok";

export const InstrumentSchema = z.object({
  symbol: z.string(),            // "AAPL"
  name: z.string().optional(),   // "Apple Inc."
  market: z.custom<Market>().default("US"),
  currency: z.string().default("USD"),
});
export type Instrument = z.infer<typeof InstrumentSchema>;

export const CandleSchema = z.object({
  t: z.number(),   // epoch ms
  o: z.number(),
  h: z.number(),
  l: z.number(),
  c: z.number(),
  v: z.number().nonnegative(), // volume
  tf: z.string(), // timeframe ex: "1m","5m","1h","1D"
});
export type Candle = z.infer<typeof CandleSchema>;

export const QuoteSchema = z.object({
  t: z.number(),   // epoch ms
  bid: z.number().nullable(),
  ask: z.number().nullable(),
  mid: z.number().nullable(),
  spread: z.number().nullable(),
  source: z.string().default("ws"),
});
export type Quote = z.infer<typeof QuoteSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  venue: z.custom<Venue>(),
  instrument: InstrumentSchema,
  side: z.custom<Side>(),
  type: z.custom<OrderType>(),
  tif: z.custom<TimeInForce>().default("day"),
  qty: z.number().positive(),
  limitPrice: z.number().optional(),
  stopPrice: z.number().optional(),
  createdAt: z.number(),
  status: z.enum(["accepted","rejected","filled","canceled","pending"]),
  meta: z.record(z.any()).optional(),
});
export type Order = z.infer<typeof OrderSchema>;

export const PositionSchema = z.object({
  id: z.string(),
  instrument: InstrumentSchema,
  qty: z.number(),
  avgPrice: z.number(),
  pnl: z.number(),
  updatedAt: z.number(),
});
export type Position = z.infer<typeof PositionSchema>;

/** Signal & Alertes IA (explicables) */
export const SignalSchema = z.object({
  id: z.string(),
  instrument: InstrumentSchema,
  tf: z.string(),
  kind: z.string(), // "MA_CROSS", "BREAKOUT", "AI_SENTIMENT_SPIKE", etc.
  score: z.number().min(-1).max(1),
  features: z.record(z.any()),  // ce que l'IA / la règle a vu
  rationale: z.string(),        // texte humain clair
  createdAt: z.number(),
});
export type Signal = z.infer<typeof SignalSchema>;

export const AlertSchema = z.object({
  id: z.string(),
  signal: SignalSchema,
  severity: z.enum(["info","watch","action"]),
  confirmedByRule: z.boolean().default(false), // double validation
  chart: z.object({
    symbol: z.string(),
    tf: z.string(),
    from: z.number(),
    to: z.number(),
  }),
});
export type Alert = z.infer<typeof AlertSchema>;

/** Santé système (observabilité) */
export const HealthSnapshotSchema = z.object({
  ts: z.number(),
  wsConnected: z.boolean(),
  wsLatencyMs: z.number().nullable(),
  restLatencyMs: z.number().nullable(),
  providerErrors1m: z.number(),
  queueLagMs: z.number().nullable(),
});
export type HealthSnapshot = z.infer<typeof HealthSnapshotSchema>;

/** Événements bus (pub/sub) */
export type DomainEvent =
  | { type: "QUOTE_TICK"; symbol: string; quote: Quote }
  | { type: "CANDLE"; symbol: string; candle: Candle }
  | { type: "ORDER_UPDATE"; order: Order }
  | { type: "POSITION_UPDATE"; position: Position }
  | { type: "SIGNAL"; signal: Signal }
  | { type: "ALERT"; alert: Alert }
  | { type: "HEALTH"; health: HealthSnapshot };

export const isEvent = (e: any): e is DomainEvent => typeof e?.type === "string";
