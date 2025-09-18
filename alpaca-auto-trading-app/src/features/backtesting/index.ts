/**
 * Backtester minimal (offline) basé sur events replay.
 * API: runBacktest({ candles, strategy }) -> résultats agrégés + equity curve.
 */
import { Candle, Instrument, Position, Signal } from "@/core/domain";
import { ok, err, Result } from "neverthrow";

export type Strategy = {
  id: string;
  init?: (ctx: any) => void;
  onBar: (ctx: { candle: Candle; instrument: Instrument }) => Signal[] | null;
  risk?: (ctx: { openPositions: Position[]; signal: Signal }) => boolean;
};

export type BacktestInput = {
  instrument: Instrument;
  candles: Candle[];
  strategy: Strategy;
  startCash?: number;
  slippageBps?: number;
  feePerOrder?: number;
};

export type BacktestOutput = Result<{
  trades: { entryT: number; exitT: number; pnl: number }[];
  equity: { t: number; value: number }[];
  summary: {
    pnl: number; maxDD: number; winRate: number; nbTrades: number;
    sharpe?: number;
  };
}, Error>;

export function runBacktest(input: BacktestInput): BacktestOutput {
  try {
    const cash = input.startCash ?? 10000;
    const equity = [{ t: input.candles[0]?.t ?? Date.now(), value: cash }];
    const trades: BacktestOutput["_unsafeUnwrap"]["trades"] = [];

    // NOTE: Ici place tes règles; on simule grossièrement pour le squelette
    for (let i=1;i<input.candles.length;i++){
      const c = input.candles[i];
      // EXEMPLE: pseudo-signal si close > open précédent
      const gain = Math.max(0, c.c - input.candles[i-1].o);
      const pnl = gain * 0.1; // taille fixe fictive
      trades.push({ entryT: input.candles[i-1].t, exitT: c.t, pnl });
      equity.push({ t: c.t, value: equity.at(-1)!.value + pnl });
    }

    const total = equity.at(-1)!.value - cash;
    const dd = Math.min(...equity.map(e => e.value)) - cash;
    const wins = trades.filter(t => t.pnl > 0).length;

    return ok({
      trades,
      equity,
      summary: {
        pnl: total,
        maxDD: Math.abs(dd),
        winRate: trades.length ? wins / trades.length : 0,
        nbTrades: trades.length,
      }
    });
  } catch (e: any) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}
