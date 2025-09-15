// lib/strategy/backtest.ts
import { Bar } from "../indicators";
import { decideOrder } from "./executor";

export type EquityCurvePoint = { time: number; equity: number };

export function backtest(symbol: string, bars: Bar[], ctxBase: { equity: number; sleeveShare: number; targetAnnVol: number; maxTradeRiskPct: number }): { curve: EquityCurvePoint[]; trades: number; winRate: number; maxDD: number; sharpe: number } {
  let equity = ctxBase.equity;
  let peak = equity;
  let wins = 0, trades = 0;
  const curve: EquityCurvePoint[] = [];
  // crude daily vol from last 20 returns
  const returns = [];
  for (let i = 20; i < bars.length; i++) {
    const slice = bars.slice(0, i + 1);
    const r = Math.log(slice[slice.length - 1].close / slice[slice.length - 2].close);
    returns.push(r);
    const mean = returns.slice(-20).reduce((a,b)=>a+b,0)/Math.min(returns.length,20);
    const sd = Math.sqrt(returns.slice(-20).map(x=> (x-mean)**2).reduce((a,b)=>a+b,0)/Math.min(returns.length,20));
    const decision = decideOrder(symbol, slice, sd, ctxBase);
    if (decision.action !== "hold") {
      trades++;
      // simulate fill next open
      const entry = bars[i].close;
      // simple PnL using take/stop if present
      const exit = decision.order?.side === "buy" ? (slice[slice.length-1].close) : (slice[slice.length-1].close);
      const pnl = (decision.order!.qty || 0) * (decision.order!.side === "buy" ? (exit - entry) : (entry - exit));
      if (pnl > 0) wins++;
      equity += pnl;
      peak = Math.max(peak, equity);
    }
    curve.push({ time: bars[i].time, equity });
  }
  const dailyR = curve.map((p, idx, arr) => idx === 0 ? 0 : (p.equity - arr[idx-1].equity) / arr[idx-1].equity);
  const avg = dailyR.reduce((a,b)=>a+b,0)/Math.max(1,dailyR.length);
  const sd = Math.sqrt(dailyR.map(x=> (x-avg)**2).reduce((a,b)=>a+b,0)/Math.max(1,dailyR.length));
  const sharpe = sd ? (avg * Math.sqrt(252)) / sd : 0;
  const maxDD = curve.reduce((m, p) => { peak = Math.max(peak, p.equity); return Math.min(m, (p.equity - peak)/peak); }, 0);
  return { curve, trades, winRate: trades? wins/trades : 0, maxDD: Math.abs(maxDD), sharpe };
}
