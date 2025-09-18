import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { returnsFromPrices, sharpe, sortino, calmar, var95, sensitivity, causalScore } from '@/lib/roi/metrics';
import { regimeState } from '@/lib/complex/chaos';
import { consciousScore } from '@/lib/conscious/score';

export async function POST(req: NextRequest) {
  const { 
    email, 
    symbol = 'SPY', 
    horizon = 'mid', 
    features = { don: 0, mom: 0.1, rsi: 50 }, 
    esg = { E: .5, S: .5, G: .5 } 
  } = await req.json() || {};
  
  const bars = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/alpaca/market/bars?symbols=${symbol}&timeframe=1Day&limit=300`).then(r => r.json());
  const arr = (bars?.bars?.[symbol] ?? []).map((b: any) => b.c);
  const rets = returnsFromPrices(arr);
  const met = { 
    sharpe: sharpe(rets), 
    sortino: sortino(rets), 
    calmar: calmar(rets), 
    var95: var95(rets) 
  };
  
  const pred = (f: any) => Math.max(0, Math.min(1, 0.45 * f.don + 0.35 * Math.max(0, Math.min(1, f.mom / 0.2)) + 0.2 * (f.rsi < 40 ? 1 : 0)));
  const sensi = sensitivity(features, pred);
  const chaos = regimeState(arr);
  const causal = causalScore(rets, rets.map((x, i) => i ? rets[i - 1] : 0), 3); // exemple: auto-granger baseline
  const conscious = consciousScore({ esg, leverage: 1, stress: 0.5 });

  const expRoi = Math.min(0.5, Math.max(-0.5, sensi.base - Math.abs(met.var95) * 0.5)); // proxy simplifié
  const results = { ...met, expRoi, sensi, causal, chaos, conscious };
  
  await prisma.roi_run.create({ 
    data: { 
      userEmail: email || 'me@example.com', 
      symbol, 
      horizon, 
      inputsJson: { features, esg }, 
      resultsJson: results 
    }
  });
  
  return Response.json({ symbol, horizon, ...results });
}
