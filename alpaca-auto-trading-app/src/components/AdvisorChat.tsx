'use client';
import { useEffect, useMemo, useState } from 'react';
import { useProfile } from '@/state/profile';
import { useAISettings } from '@/state/aiSettings';
import { useVoice } from '@/lib/voice/useVoice';
import { Toasts } from '@/lib/toast/ToastService';

type AdviceItem = { symbol:string; score:number; comp:{d:number;m:number;r:number}; rsi:number; momentum:number; breakout:boolean; action:'buy'|'add'|'trim'|'hold'|'watch' };

export default function AdvisorChat() {
  const { profile } = useProfile();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<AdviceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { supported, listening, text, start, stop, setText } = useVoice();
  const s = useAISettings();

  useEffect(()=>{ if (supported && listening) setQ(text); }, [text, supported, listening]);

  async function ask() {
    if (!profile?.email) return Toasts.show('Profil requis', 'Renseigne ton email dans Profil');
    setLoading(true);
    // Univers = watchlist + top ETF par défaut
    const universe = Array.from(new Set([...(profile.holdings?.map(h=>h.symbol) ?? []), 'SPY','QQQ','DIA','IWM','TLT','XLK','XLF','SMH','ARKK'])).slice(0, 120);
    const body = { email: profile.email, universe, holdings: profile.holdings?.map(h=>h.symbol) ?? [] };
    const r = await fetch('/api/ai/advice', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
    const j = await r.json();
    setItems((j?.items ?? []).slice(0, 20));
    setLoading(false);
  }

  async function feedback(it: AdviceItem, decision:'accepted'|'rejected') {
    if (!profile?.email) return;
    const context = { weights: { wDonchian:s.wDonchian, wMomentum:s.wMomentum, wRSI:s.wRSI }, buyThreshold:s.buyThreshold };
    await fetch('/api/ai/feedback', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ email:profile.email, symbol: it.symbol, action: it.action, score: it.score, decision, context }) });
    // Adaptation simple: si accepté buy/add → +wMomentum ; si rejeté trim/sell → -wDonchian
    if (decision==='accepted' && (it.action==='buy' || it.action==='add')) s.set({ wMomentum: Math.min(1, s.wMomentum + 0.03) });
    if (decision==='rejected' && (it.action==='trim')) s.set({ wDonchian: Math.max(0, s.wDonchian - 0.03) });
    Toasts.show('Merci!', 'Tes préférences ont été prises en compte.');
  }

  return (
    <div className="rounded border p-3 space-y-3" id="AdvisorChat">
      <div className="flex items-center gap-2">
        <input
          value={q} onChange={e=>setQ(e.target.value)}
          placeholder="Pose une question (ex: que renforcer aujourd'hui ?)…"
          className="flex-1 rounded border px-3 py-2 text-sm"
        />
        {supported && (
          <button onClick={()=> listening ? stop() : start()} className={`rounded px-2 py-1 text-sm border ${listening?'bg-red-600 text-white':'bg-white'}`}>
            {listening ? 'Stop' : '🎤'}
          </button>
        )}
        <button onClick={ask} className="rounded bg-blue-600 text-white px-3 py-2 text-sm">{loading?'Analyse…':'Analyser'}</button>
      </div>

      <div className="text-xs text-gray-500">
        Conseils générés pour <span className="font-semibold">{profile?.displayName || profile?.email}</span> — profil: risque {profile?.riskLevel ?? 2}, horizon {profile?.horizonYears ?? 5} ans.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {items.map(it => (
          <div key={it.symbol} className="rounded border p-2 text-sm">
            <div className="flex items-center justify-between">
              <a href={`/symbol/${it.symbol}`} className="font-mono font-semibold">{it.symbol}</a>
              <span className="text-gray-500">{(it.score*100).toFixed(0)}%</span>
            </div>
            <div className="text-xs text-gray-500">
              Donchian {(it.comp.d*100).toFixed(0)}% + Momentum {(it.comp.m*100).toFixed(0)}% + RSI {(it.comp.r*100).toFixed(0)}%
            </div>
            <div className="mt-1">
              Action: <span className={
                it.action==='buy' ? 'text-green-600' :
                it.action==='add' ? 'text-emerald-600' :
                it.action==='trim' ? 'text-red-600' : 'text-gray-600'
              }>{labelAction(it.action)}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button onClick={()=>feedback(it,'accepted')} className="flex-1 rounded bg-emerald-600 text-white px-2 py-1 text-xs">👍 J'aime</button>
              <button onClick={()=>feedback(it,'rejected')} className="flex-1 rounded bg-gray-200 dark:bg-gray-800 px-2 py-1 text-xs">👎 Pas pertinent</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function labelAction(a: AdviceItem['action']){ return a==='buy'?'Acheter':a==='add'?'Renforcer':a==='trim'?'Alléger':a==='sell'?'Vendre':'Observer'; }
