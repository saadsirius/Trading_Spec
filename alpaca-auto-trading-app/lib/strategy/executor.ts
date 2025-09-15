// lib/strategy/executor.ts
import type { Bar } from "../indicators";
import { combineSignals, attachStops } from "./signals";
import { positionNotionalFromVol, capByRiskLimits, kellyFraction } from "../risk";

type ExecCtx = {
  equity: number;
  sleeveShare: number;          // 0.35 trend, 0.15 mean-revert etc.
  targetAnnVol: number;         // 0.10
  maxTradeRiskPct: number;      // 0.005
  winRate?: number;             // from backtest; default 0.52
  payoff?: number;              // avg win/avg loss; default 1.1
};

export function decideOrder(symbol: string, bars: Bar[], dailyVol: number, ctx: ExecCtx) {
  const raw = attachStops(bars, combineSignals(bars));
  if (raw.action === "hold") return { action: "hold" as const, reason: raw.reason };

  const last = bars[bars.length - 1];
  const k = kellyFraction(ctx.winRate ?? 0.52, ctx.payoff ?? 1.1);
  const notionalBase = positionNotionalFromVol(dailyVol, ctx.equity, ctx.sleeveShare, ctx.targetAnnVol);
  const desired = notionalBase * k; // Kelly-cap applied
  const { qty } = capByRiskLimits(desired, last.close, (raw.stop ? Math.abs(last.close - raw.stop) : undefined), {
    equity: ctx.equity,
    maxTradeRiskPct: ctx.maxTradeRiskPct,
    maxDailyRiskPct: 0.01,
    targetAnnVol: ctx.targetAnnVol,
    kellyCap: 0.25,
  });

  if (qty <= 0) return { action: "hold" as const, reason: "Risk cap -> qty 0" };

  return {
    action: raw.action,
    order: {
      symbol,
      qty, // use notional if Alpaca fractional crypto; for stocks qty is fine (fractionals also support notional)
      side: raw.action === "buy" ? "buy" : "sell",
      type: "market",
      time_in_force: "day" as const,
      ...(raw.stop && { stop_loss: { stop_price: raw.stop } }),
      ...(raw.take && { take_profit: { limit_price: raw.take } }),
    },
    reason: raw.reason,
    confidence: raw.confidence,
  };
}
