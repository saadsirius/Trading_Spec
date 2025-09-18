import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';

type Bar = { t:string; o:number; h:number; l:number; c:number };
async function fetchBarsMany(symbols: string[], timeframe='1Day', limit=90): Promise<Record<string, Bar[]>> {
  const chunk = <T,>(arr:T[],n:number)=>arr.length<=n?[arr]:[arr.slice(0,n),...chunk(arr.slice(n),n)];
  const out: Record<string, Bar[]> = {};
  for (const g of chunk(symbols, 100)) {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/alpaca/market/bars?symbols=${g.join(',')}&timeframe=${timeframe}&limit=${limit}`;
    const j = await (await fetch(url)).json();
    Object.assign(out, j?.bars ?? {});
  }
  return out;
}

function scoreHeuristic(bars: Bar[]) {
  if (!bars || bars.length < 25) return { ok:false as const, score:0, comp:{d:0,m:0,r:0}, rsi:0, momentum:0, breakout:false };
  const closes = bars.map(b=>b.c), highs=bars.map(b=>b.h), lows=bars.map(b=>b.l);
  const n = closes.length, last = closes[n-1];
  // RSI(14)
  let gains=0, losses=0; for (let i=n-15;i<n-1;i++){ const d=closes[i+1]-closes[i]; if(d>=0) gains+=d; else losses-=d; }
  const rs = losses===0 ? 100 : gains/Math.max(1e-6,losses); const rsi = 100 - 100/(1+rs);
  // Momentum vs SMA20
  const sma20 = closes.slice(-20).reduce((a,b)=>a+b,0)/20;
  const momentum = (last - sma20)/sma20;
  // Donchian 20
  const maxH = Math.max(...highs.slice(-20));
  const breakout = last >= maxH;

  // Poids par défaut (seront ajustés par profil)
  const w = { wDonchian:0.45, wMomentum:0.35, wRSI:0.20 };
  const clamp01 = (x:number)=> Math.max(0,Math.min(1,x));
  const d = breakout ? 1 : 0;
  const m = clamp01(Math.max(0, momentum) / 0.2);
  const r = rsi < 30 ? 1 : rsi < 45 ? 0.33 : 0;
  const score = clamp01(w.wDonchian*d + w.wMomentum*m + w.wRSI*r);
  return { ok:true as const, score, comp:{ d: w.wDonchian*d, m: w.wMomentum*m, r: w.wRSI*r }, rsi, momentum, breakout };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, universe = ['SPY','QQQ','DIA','IWM'], holdings = [] } = body ?? {};
    if (!email) return new Response('email_required', { status: 400 });

    const prof = await prisma.user_profile.findUnique({ where: { email } });
    const risk = prof?.riskLevel ?? 2;
    const horizon = prof?.horizonYears ?? 5;

    const bars = await fetchBarsMany(universe, '1Day', 90);
    const scored = universe.map(s => {
      const res = scoreHeuristic(bars[s] ?? []);
      // Ajustements profil : plus de momentum pour risk=3, plus de RSI (value) pour risk=1
      let score = res.score;
      if (risk===3) score = Math.min(1, score + (res.momentum>0 ? 0.05 : 0));
      if (risk===1) score = Math.min(1, score + (res.rsi<40 ? 0.05 : 0));
      // Horizon long : légère prime Donchian
      if (horizon>=7 && res.breakout) score = Math.min(1, score + 0.03);
      const action = holdings.includes(s) ? (res.rsi>70 ? 'trim' : score>=0.65 ? 'add' : 'hold') : (score>=0.7 ? 'buy' : 'watch');
      return { symbol:s, ...res, score, action };
    }).sort((a,b)=> b.score - a.score);

    return Response.json({ items: scored });
  } catch (e:any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'advice_error' }), { status: 500 });
  }
}
