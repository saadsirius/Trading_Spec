import { z } from "zod";

export const PositionSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  qty: z.number(),
  avgPrice: z.number(),
  marketPrice: z.number(),
  pnl: z.number(),
  pnlPct: z.number(),
  sector: z.string().optional(),
  updatedAt: z.string(), // ISO
});

export const OrderSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  side: z.enum(["buy","sell"]),
  type: z.enum(["market","limit","stop","stop_limit"]).optional(),
  qty: z.number(),
  price: z.number().optional(),
  status: z.enum(["new","filled","partially_filled","canceled","rejected"]),
  createdAt: z.string(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  side: z.enum(["buy","sell","dividend","fee","interest"]),
  qty: z.number().optional(),
  price: z.number().optional(),
  amount: z.number().optional(),
  ts: z.string(), // ISO
  ref: z.string().optional(), // lien traçable (orderId, transferId)
});

export const PortfolioSummarySchema = z.object({
  equity: z.number(),
  cash: z.number(),
  dayPnl: z.number(),
  dayPnlPct: z.number(),
  allTimePnl: z.number(),
});

export const WatchItemSchema = z.object({
  symbol: z.string(),
  name: z.string().optional(),
  note: z.string().optional(),
  sentiment: z.number().min(-1).max(1).optional(),
  lastPrice: z.number().optional(),
  changePct: z.number().optional(),
});

export const HistoryFilterSchema = z.object({
  symbol: z.string().optional(),
  side: z.enum(["buy","sell","dividend","fee","interest"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
}).strict();

export type Position = z.infer<typeof PositionSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
export type WatchItem = z.infer<typeof WatchItemSchema>;
export type HistoryFilter = z.infer<typeof HistoryFilterSchema>;
