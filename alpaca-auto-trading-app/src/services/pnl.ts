import type { PnLPoint, Trade, BacktestMetrics } from '@/src/types/market';
import { clamp } from '@/src/utils/num';
import { mean, deviation } from 'd3-array';

export function aggregateDailyPnL(trades: Trade[]): PnLPoint[] {
  const byDay = new Map<string, number>();
  for (const t of trades) {
    const day = (t.ts||'').slice(0,10);
    const cash = (t.side==='sell' ? 1 : -1) * (t.qty * t.price) - (t.fee||0);
    byDay.set(day, (byDay.get(day)||0) + cash);
  }
  return Array.from(byDay.entries()).sort((a,b)=> a[0].localeCompare(b[0])).map(([date,pnl])=>({date,pnl}));
}

export function cumulative(points: PnLPoint[]): PnLPoint[] {
  let acc=0;
  return points.map(p=> ({ date: p.date, pnl: (acc+=p.pnl) }));
}

export function backtestMetrics(equityCurve: number[], riskFreeRate=0): BacktestMetrics {
  // equityCurve: valeurs cumulées jour après jour
  const rets:number[]=[];
  for (let i=1;i<equityCurve.length;i++){
    const r = (equityCurve[i]-equityCurve[i-1])/(equityCurve[i-1]||1);
    rets.push(r);
  }
  const annFactor = 252;
  const avg = mean(rets)||0;
  const vol = deviation(rets)||0;
  const downside = deviation(rets.filter(r=> r<0)) || 1e-9;
  const sharpe = (avg - riskFreeRate/annFactor) / (vol||1e-9) * Math.sqrt(annFactor);
  const sortino = (avg - riskFreeRate/annFactor) / (downside||1e-9) * Math.sqrt(annFactor);
  let peak = equityCurve[0]||0, mdd=0;
  for (const v of equityCurve){
    peak = Math.max(peak, v);
    mdd = Math.min(mdd, (v-peak)/peak);
  }
  const cagr = Math.pow((equityCurve.at(-1)||1)/(equityCurve[0]||1), (252/equityCurve.length)) - 1;
  const wins = rets.filter(r=> r>0).length;
  return {
    cagr, sharpe, sortino, maxDrawdown: Math.abs(mdd||0)*100, winRate: (wins/Math.max(1,rets.length))*100, trades: rets.length
  };
}
