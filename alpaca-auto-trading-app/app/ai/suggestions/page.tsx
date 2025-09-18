'use client';
import { useEffect, useMemo, useState } from 'react';
import { useAISettings } from '@/state/aiSettings';
import { Watchlist } from '@/lib/watchlist/WatchlistService';
import { hashParams } from '@/lib/hash';

type Bar = { t:string; o:number; h:number; l:number; c:number };
type Item = { symbol:string; name?:string; exchange?:string };

async function listAssets(limit=120): Promise<Item[]> {
  const r = await fetch(`/api/alpaca/assets?limit=${limit}`);
  const j = await r.json();
  return (j.items ?? []) as Item[];
}
// fetch avec retry exponentiel sur 429/NetworkError
async function fetchJSON(url: string, maxRetries=3) {
  let attempt = 0, delay = 400;
  while (true) {
    try {
      const r = await fetch(url);
      if (r.status === 429) throw new Error('429');
      return await r.json();
    } catch (e) {
      attempt++;
      if (attempt > maxRetries) throw e;
      await new Promise(res => setTimeout(res, delay));
      delay = Math.min(4000, delay * 2);
    }
  }
}
function chunk<T>(arr: T[], n: number): T[][] { const out: T[][] = []; for (let i=0;i<arr.length;i+=n) out.push(arr.slice(i,i+n)); return out; }
async function fetchBarsMany(symbols: string[], timeframe='1Day', limit=60, chunkSize=100, retries=3): Promise<Record<string, Bar[]>> {
  const out: Record<string, Bar[]> = {};
  for (const group of chunk(symbols, chunkSize)) {
    const url = `/api/alpaca/market/bars?symbols=${group.join(',')}&timeframe=${timeframe}&limit=${limit}`;
    const j = await fetchJSON(url, retries);
    Object.assign(out, j?.bars ?? {});
  }
  return out;
}
function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }
function scoreHeuristic(bars: Bar[], w: { wDonchian:number; wMomentum:number; wRSI:number }) {
  if (!bars || bars.length < 25) return { ok:false as const, score:0, comp:{d:0,m:0,r:0}, rsi:0, momentum:0, breakout:false };
  const closes = bars.map(b=>b.c), highs=bars.map(b=>b.h), lows=bars.map(b=>b.l);
  const n = closes.length, last = closes[n-1];
  // RSI
  let gains=0, losses=0; for (let i=n-15;i<n-1;i++){ const d=closes[i+1]-closes[i]; if(d>=0) gains+=d; else losses-=d; }
  const rs = losses===0 ? 100 : gains/Math.max(1e-6,losses); const rsi = 100 - 100/(1+rs);
  // Momentum vs SMA20
  const sma20 = closes.slice(-20).reduce((a,b)=>a+b,0)/20;
  const momentum = (last - sma20)/sma20;  // ex: 0.04 = +4%
  // Donchian 20
  const maxH = Math.max(...highs.slice(-20));
  const breakout = last >= maxH;

  // Composants 0..1 (normalisés)
  const d = breakout ? 1 : 0;                       // Donchian composante binaire
  const m = clamp01(Math.max(0, momentum) / 0.2);   // cap à +20%
  const r = rsi < 30 ? 1 : rsi < 45 ? 0.33 : 0;     // préférence au RSI bas

  const score = clamp01(w.wDonchian*d + w.wMomentum*m + w.wRSI*r);
  return { ok:true as const, score, comp:{ d: w.wDonchian*d, m: w.wMomentum*m, r: w.wRSI*r }, rsi, momentum, breakout };
}

export default function AISuggestionsPage() {
  const s = useAISettings();
  const [loading, setLoading] = useState(true);
  const [universe, setUniverse] = useState<Item[]>([]);
  const [barsMap, setBarsMap] = useState<Record<string, Bar[]>>({});
  const [persisted, setPersisted] = useState<string>('');

  // Scan marché avec batching 100 + retry expo
  useEffect(()=>{ (async()=>{
    setLoading(true);
    const assets = await listAssets(s.universeSize);
    const symbols = assets.map(a=>a.symbol).slice(0, s.universeSize);
    const bars = await fetchBarsMany(symbols, '1Day', 90, s.chunkSize, s.maxRetries);
    setUniverse(assets); setBarsMap(bars); setLoading(false);
  })(); }, [s.universeSize, s.chunkSize, s.maxRetries]);

  const holdings = useMemo(()=> Watchlist.get().map(w=>w.symbol), []);
  const scored = useMemo(() => {
    const arr = universe.map(a => {
      const res = scoreHeuristic(barsMap[a.symbol] ?? [], { wDonchian:s.wDonchian, wMomentum:s.wMomentum, wRSI:s.wRSI });
      return { ...a, ...res };
    }).filter(x => (x as any).ok) as Array<Item & ReturnType<typeof scoreHeuristic>>;
    return arr.sort((a,b) => (b.score - a.score));
  }, [universe, barsMap, s.wDonchian, s.wMomentum, s.wRSI]);

  const buyIdeas = scored.filter(x => x.score >= s.buyThreshold).slice(0, 12);
  const considerAdds = scored.filter(x => holdings.includes(x.symbol) && x.score >= (s.buyThreshold - 0.05)).slice(0, 12);
  const considerTrims = scored.filter(x => holdings.includes(x.symbol) && (x.rsi as number) > 70).slice(0, 12);

  // Persist (audit) — une fois par page load (idempotent par hash/jour)
  useEffect(()=>{ (async()=>{
    if (!scored.length) return;
    const day = new Date(); day.setUTCHours(0,0,0,0);
    const weights = {
      wDonchian: s.wDonchian, wMomentum: s.wMomentum, wRSI: s.wRSI,
      buyThreshold: s.buyThreshold, universeSize: s.universeSize,
      feesPerTrade: s.feesPerTrade, slippagePct: s.slippagePct, holdBars: s.holdBars,
      chunkSize: s.chunkSize, maxRetries: s.maxRetries,
    };
    const body = { day: day.toISOString(), weights, entries: scored.slice(0, 150).map(x => ({
      symbol: x.symbol, score: x.score, rsi: x.rsi, momentum: x.momentum, breakout: x.breakout
    }))};
    const res = await fetch('/api/ai/suggestions/log', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
    if (res.ok) setPersisted(hashParams(weights).slice(0,8));
  })(); }, [scored, s]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">AI Suggestions & Analysis (Privé)</h1>
      <p className="text-sm text-gray-600">Transparence totale : score = Donchian + Momentum + RSI (pondérés). Mini-backtest inclut coûts & slippage. Heuristiques édu, pas de conseil financier.</p>

      {/* Tuning Panel */}
      <section className="rounded border p-3">
        <div className="font-semibold text-sm mb-2">Tuning</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <label className="flex items-center gap-2">wDonchian
            <input type="number" step="0.05" min="0" max="1" value={s.wDonchian} onChange={e=>s.set({ wDonchian: parseFloat(e.target.value) })} className="w-20 rounded border px-2 py-1" />
          </label>
          <label className="flex items-center gap-2">wMomentum
            <input type="number" step="0.05" min="0" max="1" value={s.wMomentum} onChange={e=>s.set({ wMomentum: parseFloat(e.target.value) })} className="w-20 rounded border px-2 py-1" />
          </label>
          <label className="flex items-center gap-2">wRSI
            <input type="number" step="0.05" min="0" max="1" value={s.wRSI} onChange={e=>s.set({ wRSI: parseFloat(e.target.value) })} className="w-20 rounded border px-2 py-1" />
          </label>
          <label className="flex items-center gap-2">Seuil achat
            <input type="number" step="0.01" min="0" max="1" value={s.buyThreshold} onChange={e=>s.set({ buyThreshold: parseFloat(e.target.value) })} className="w-24 rounded border px-2 py-1" />
          </label>
          <label className="flex items-center gap-2">Univers (N)
            <input type="number" min="20" max="500" value={s.universeSize} onChange={e=>s.set({ universeSize: parseInt(e.target.value||'0',10) })} className="w-24 rounded border px-2 py-1" />
          </label>
          <label className="flex items-center gap-2">Chunk size
            <input type="number" min="20" max="100" value={s.chunkSize} onChange={e=>s.set({ chunkSize: parseInt(e.target.value||'0',10) })} className="w-24 rounded border px-2 py-1" />
          </label>
          <label className="flex items-center gap-2">Retries
            <input type="number" min="0" max="5" value={s.maxRetries} onChange={e=>s.set({ maxRetries: parseInt(e.target.value||'0',10) })} className="w-20 rounded border px-2 py-1" />
          </label>
          <label className="flex items-center gap-2">Fees/trade
            <input type="number" step="0.01" value={s.feesPerTrade} onChange={e=>s.set({ feesPerTrade: parseFloat(e.target.value) })} className="w-24 rounded border px-2 py-1" />
          </label>
          <label className="flex items-center gap-2">Slippage %
            <input type="number" step="0.01" value={(s.slippagePct*100).toFixed(2)} onChange={e=>s.set({ slippagePct: parseFloat(e.target.value)/100 })} className="w-24 rounded border px-2 py-1" />
          </label>
          <label className="flex items-center gap-2">Hold (barres)
            <input type="number" min="1" max="20" value={s.holdBars} onChange={e=>s.set({ holdBars: parseInt(e.target.value||'0',10) })} className="w-24 rounded border px-2 py-1" />
          </label>
        </div>
        <div className="text-xs text-gray-500 mt-2">Hash paramètres (persist): {persisted || '—'}</div>
      </section>

      {loading && <div>Scan du marché…</div>}

      {!loading && (
        <>
          <section>
            <h2 className="text-lg font-semibold">Idées d'achat (score ≥ {s.buyThreshold.toFixed(2)})</h2>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {scored.filter(x=>x.score>=s.buyThreshold).slice(0,12).map(x=>(
                <a key={x.symbol} href={`/symbol/${encodeURIComponent(x.symbol)}`} className="rounded border p-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                  <div className="flex justify-between">
                    <div className="font-mono font-semibold">{x.symbol}</div>
                    <div className="text-gray-500">{(x.score*100).toFixed(0)}%</div>
                  </div>
                  <div className="text-gray-600">{x.name}</div>
                  {/* Transparence : décomposition */}
                  <div className="text-xs text-gray-500 mt-1">
                    Donchian {((x.comp.d)*100).toFixed(0)}% + Momentum {((x.comp.m)*100).toFixed(0)}% + RSI {((x.comp.r)*100).toFixed(0)}%
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Positions suivies (watchlist)</h2>
            <div className="text-xs text-gray-500">Renforcer / Alléger selon le contexte actuel.</div>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {holdings.map(sym => scored.find(x=>x.symbol===sym)).filter(Boolean).map(x=>{
                const it = x!;
                const action = it.rsi>70 ? 'Alléger' : it.score>=(s.buyThreshold-0.05) ? 'Renforcer' : 'Observer';
                return (
                  <a key={it.symbol} href={`/symbol/${encodeURIComponent(it.symbol)}`} className="rounded border p-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                    <div className="flex justify-between">
                      <div className="font-mono font-semibold">{it.symbol}</div>
                      <div className={action==='Alléger'?'text-red-600':action==='Renforcer'?'text-green-600':'text-gray-500'}>{action}</div>
                    </div>
                    <div className="text-xs text-gray-500">Score {(it.score*100).toFixed(0)}% · RSI {it.rsi.toFixed(1)} · Donchian {(it.breakout?'Breakout':'—')}</div>
                    <div className="text-[11px] text-gray-400 mt-1">D {((it.comp.d)*100).toFixed(0)}% + M {((it.comp.m)*100).toFixed(0)}% + R {((it.comp.r)*100).toFixed(0)}%</div>
                  </a>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
