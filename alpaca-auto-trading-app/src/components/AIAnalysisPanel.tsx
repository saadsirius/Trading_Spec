'use client';
import { useEffect, useMemo, useState } from 'react';
import { AlertService } from '@/services/AlertService';
import { Toasts } from '@/lib/toast/ToastService';

type Bar = { t: string; o:number; h:number; l:number; c:number };

async function fetchBars(symbol: string, timeframe='5Min', limit=200): Promise<Bar[]> {
  const res = await fetch(`/api/alpaca/market/bars?symbols=${encodeURIComponent(symbol)}&timeframe=${timeframe}&limit=${limit}`);
  const json = await res.json();
  return (json?.bars?.[symbol] ?? []) as Bar[];
}

export default function AIAnalysisPanel({ symbol }: { symbol: string }) {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ let stop=false;
    (async()=>{
      setLoading(true);
      const b = await fetchBars(symbol);
      if (stop) return;
      setBars(b); setLoading(false);
      // Eval alerts (side-effect)
      await AlertService.evaluate(symbol, b.map(x=>({c:x.c,h:x.h,l:x.l})));
      Toasts.showById(`ai-${symbol}`, `AI Analysis ${symbol}`, `Barres: ${b.length}`, 1500);
    })();
    const id = setInterval(async()=>{
      const b = await fetchBars(symbol);
      setBars(b);
      await AlertService.evaluate(symbol, b.map(x=>({c:x.c,h:x.h,l:x.l})));
    }, 5000);
    return ()=>{ stop=true; clearInterval(id); };
  }, [symbol]);

  const metrics = useMemo(()=>{
    if (bars.length<20) return null;
    const closes = bars.map(b=>b.c), highs = bars.map(b=>b.h), lows = bars.map(b=>b.l);
    const n = closes.length;
    // RSI 14 approx
    let gains=0, losses=0;
    for (let i=n-15;i<n-1;i++){ const d=closes[i+1]-closes[i]; if(d>=0) gains+=d; else losses-=d; }
    const rs = losses===0 ? 100 : gains/Math.max(1e-6,losses);
    const rsi = 100 - 100/(1+rs);
    // Donchian
    const maxH = Math.max(...highs.slice(-20)), minL = Math.min(...lows.slice(-20));
    const last = closes[n-1]; const donchianUp = last>=maxH; const donchianDown = last<=minL;
    // ADX proxy
    const avgRange = highs.slice(-14).reduce((a,h,i)=>a+(h-lows[n-14+i]),0)/14;
    const adxProxy = (avgRange/Math.max(1e-6,last))*100;
    return { rsi, donchianUp, donchianDown, adxProxy, last };
  }, [bars]);

  return (
    <section className="rounded border p-3 space-y-2">
      <div className="text-sm font-semibold">AI Analysis</div>
      {loading && <div className="text-sm text-gray-500">Chargement…</div>}
      {!loading && metrics && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>Dernier: <span className="font-mono">{metrics.last.toFixed(2)}</span></div>
          <div>RSI(14): <span className="font-mono">{metrics.rsi.toFixed(1)}</span></div>
          <div>ADX≈: <span className="font-mono">{metrics.adxProxy.toFixed(1)}</span></div>
          <div>Donchian: {metrics.donchianUp ? 'Breakout ↑' : metrics.donchianDown ? 'Breakdown ↓' : '—'}</div>
        </div>
      )}
      {!loading && !metrics && <div className="text-sm text-gray-500">Pas assez de données</div>}
    </section>
  );
}
