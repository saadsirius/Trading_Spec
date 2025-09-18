'use client';
import { useEffect, useMemo, useState } from 'react';
import { useUI } from '@/state/uiStore';
import { useAISettings } from '@/state/aiSettings';
type Bar = { t:string; o:number; h:number; l:number; c:number };

async function fetchBars(symbol: string, timeframe='5Min', limit=200): Promise<Bar[]> {
  const r = await fetch(`/api/alpaca/market/bars?symbols=${encodeURIComponent(symbol)}&timeframe=${timeframe}&limit=${limit}`);
  const j = await r.json();
  return (j?.bars?.[symbol] ?? []) as Bar[];
}

export default function AISidePanel() {
  const { aiPanelOpen, setAiPanelOpen, currentSymbol, timeframe } = useUI();
  const { feesPerTrade, slippagePct, holdBars } = useAISettings();
  const [bars, setBars] = useState<Bar[]>([]);
  useEffect(()=>{ if (!aiPanelOpen || !currentSymbol) return; (async()=> setBars(await fetchBars(currentSymbol, timeframe, 200)))(); }, [aiPanelOpen, currentSymbol, timeframe]);

  const analytics = useMemo(() => {
    if (!bars.length) return null;
    const closes = bars.map(b=>b.c), highs=bars.map(b=>b.h), lows=bars.map(b=>b.l);
    const n = closes.length, last = closes[n-1];
    let gains=0, losses=0; for (let i=n-15;i<n-1;i++){ const d=closes[i+1]-closes[i]; if(d>=0) gains+=d; else losses-=d; }
    const rs = losses===0 ? 100 : gains/Math.max(1e-6, losses); const rsi = 100 - 100/(1+rs);
    const maxH = Math.max(...highs.slice(-20)), minL = Math.min(...lows.slice(-20));
    const breakoutUp = last>=maxH, breakdown = last<=minL;
    const sma20 = closes.slice(-20).reduce((a,b)=>a+b,0)/Math.min(20, closes.length);
    const momentum = (last - sma20)/sma20;

    // Backtest: breakout Donchian; hold = holdBars; stop = minL20; slippage sur entrée/sortie; fees par trade
    let pnl=0, wins=0, trades=0;
    for (let i=20; i<n-(holdBars+1); i++){
      const localHigh = Math.max(...highs.slice(i-20, i+1));
      const localLow  = Math.min(...lows.slice(i-20, i+1));
      if (closes[i] >= localHigh) {
        trades++;
        const entryRaw = closes[i];
        const entry = entryRaw * (1 + slippagePct) - feesPerTrade; // coût + slippage
        const stop = localLow * (1 - slippagePct);
        let exit = closes[i+holdBars] * (1 - slippagePct) - feesPerTrade;
        for (let k=i+1;k<=i+holdBars;k++){ if (lows[k] <= stop){ exit = stop - feesPerTrade; break; } }
        pnl += (exit - entry);
        if (exit > entry) wins++;
      }
    }
    const avgPnL = trades ? pnl/trades : 0;
    const winRate = trades ? wins/trades : 0;
    return { last, rsi, breakoutUp, breakdown, momentum, trades, avgPnL, winRate };
  }, [bars, feesPerTrade, slippagePct, holdBars]);

  if (!aiPanelOpen) return null;
  return (
    <aside className="fixed right-0 top-14 bottom-0 w-[360px] border-l bg-white dark:bg-gray-900 dark:border-gray-700 z-40">
      <div className="p-3 flex items-center justify-between border-b">
        <div className="font-semibold text-sm">AI Analysis</div>
        <button className="text-xs text-gray-500" onClick={()=>setAiPanelOpen(false)}>Fermer</button>
      </div>
      <div className="p-3 text-sm space-y-3">
        {!currentSymbol && <div>Sélectionne un symbole.</div>}
        {currentSymbol && !bars.length && <div>Chargement…</div>}
        {currentSymbol && bars.length>0 && analytics && (
          <>
            <div>Dernier: <span className="font-mono">{analytics.last.toFixed(2)}</span></div>
            <div>RSI(14): <span className="font-mono">{analytics.rsi.toFixed(1)}</span></div>
            <div>Donchian20: {analytics.breakoutUp ? 'Breakout ↑' : analytics.breakdown ? 'Breakdown ↓' : '—'}</div>
            <div>Momentum (vs SMA20): <span className="font-mono">{(analytics.momentum*100).toFixed(1)}%</span></div>
            <div className="pt-2 border-t">
              <div className="font-semibold mb-1">Backtest court · costs & slippage</div>
              <div>Trades: {analytics.trades} • WinRate: {(analytics.winRate*100).toFixed(0)}% • AvgPnL: {analytics.avgPnL.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Fees/trade: {feesPerTrade} • Slippage: {(slippagePct*100).toFixed(2)}% • Hold: {holdBars} barres</div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
