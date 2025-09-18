'use client';
import { useEffect, useState } from 'react';
import { useProfile } from '@/state/profile';
import { Toasts } from '@/lib/toast/ToastService';

type Rule = { id:string; symbol:string; kind:'rsi_low'|'don_breakout'|'pct_drop'; threshold:number; enabled:boolean };
export default function PersonalAlerts() {
  const { profile } = useProfile();
  const [rules, setRules] = useState<Rule[]>([]);
  useEffect(()=>{ const r = localStorage.getItem('personal_alerts'); setRules(r?JSON.parse(r):[]); }, []);
  function save(n:Rule[]){ setRules(n); localStorage.setItem('personal_alerts', JSON.stringify(n)); }

  function add(kind:Rule['kind']) {
    const sym = prompt('Symbole ? ex: AAPL')?.toUpperCase(); if (!sym) return;
    const th = Number(prompt(kind==='rsi_low'?'RSI <= ? (ex:30)':'Seuil (% pour pct_drop, vide pour Donchian)', kind==='pct_drop'?'3':''));
    const id = `r-${Date.now()}`;
    save([{ id, symbol:sym, kind, threshold: th || 0, enabled: true }, ...rules]);
  }
  async function testEval() {
    // Exemple: appelle ton moteur existant /api/alerts/eval avec ces règles
    const r = await fetch('/api/alerts/eval', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ rules }) });
    const j = await r.json().catch(()=>({}));
    Toasts.show('Évaluation déclenchée', `Résultats ${j?.fired?.length ?? 0}`);
  }

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Alertes Personnelles</h1>
      <div className="text-sm text-gray-500">Profil: {profile?.displayName || profile?.email}</div>
      <div className="flex flex-wrap gap-2">
        <button onClick={()=>add('rsi_low')} className="rounded border px-2 py-1 text-sm">+ RSI ≤ X</button>
        <button onClick={()=>add('don_breakout')} className="rounded border px-2 py-1 text-sm">+ Donchian breakout</button>
        <button onClick={()=>add('pct_drop')} className="rounded border px-2 py-1 text-sm">+ Chute % jour</button>
        <button onClick={testEval} className="rounded bg-blue-600 text-white px-2 py-1 text-sm">Évaluer maintenant</button>
      </div>
      <div className="space-y-2">
        {rules.map(r=>(
          <div key={r.id} className="rounded border p-2 text-sm flex items-center justify-between">
            <div><span className="font-mono">{r.symbol}</span> — {label(r)}</div>
            <div className="flex items-center gap-2">
              <label className="text-xs"><input type="checkbox" checked={r.enabled} onChange={e=>save(rules.map(x=>x.id===r.id?{...x,enabled:e.target.checked}:x))}/> activée</label>
              <button onClick={()=>save(rules.filter(x=>x.id!==r.id))} className="text-xs text-red-600">Supprimer</button>
            </div>
          </div>
        ))}
        {rules.length===0 && <div className="text-xs text-gray-500">Aucune alerte. Ajoute-en avec les boutons ci-dessus.</div>}
      </div>
    </div>
  );
}
function label(r:Rule){
  if (r.kind==='rsi_low') return `RSI ≤ ${r.threshold}`;
  if (r.kind==='pct_drop') return `Baisse ≥ ${r.threshold}%`;
  return 'Donchian breakout';
}
