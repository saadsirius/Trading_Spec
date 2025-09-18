'use client';
import { useEffect, useState } from 'react';
import { useProfile } from '@/state/profile';
import Projections from '@/components/Projections';
import AdvisorChat from '@/components/AdvisorChat';
import { Toasts } from '@/lib/toast/ToastService';

export default function AdvisorDashboard() {
  const { profile, setProfile, load, save } = useProfile();
  const [email, setEmail] = useState('');

  useEffect(()=>{ // auto-load si email en localStorage
    const e = localStorage.getItem('user_email') ?? '';
    if (e) { setEmail(e); load(e); }
  }, [load]);

  const holdingsStr = (profile?.holdings ?? []).map(h => h.symbol).join(',');

  return (
    <div className="p-4 space-y-6" id="PersonalAdvisor">
      <h1 className="text-xl font-semibold">Mon Conseiller Financier (Privé)</h1>

      <section className="rounded border p-3 space-y-3" id="Profile">
        <div className="font-semibold text-sm">Profil</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <label className="flex items-center gap-2">Email
            <input className="flex-1 rounded border px-2 py-1" value={email} onChange={e=>setEmail(e.target.value)} placeholder="toi@exemple.com" />
          </label>
          <label className="flex items-center gap-2">Nom
            <input className="flex-1 rounded border px-2 py-1" value={profile?.displayName ?? ''} onChange={e=>setProfile({ displayName: e.target.value })} />
          </label>
          <label className="flex items-center gap-2">Risque (1-3)
            <input type="number" min={1} max={3} className="w-20 rounded border px-2 py-1" value={profile?.riskLevel ?? 2} onChange={e=>setProfile({ riskLevel: Math.max(1, Math.min(3, Number(e.target.value))) as any })} />
          </label>
          <label className="flex items-center gap-2">Horizon (ans)
            <input type="number" min={1} max={50} className="w-24 rounded border px-2 py-1" value={profile?.horizonYears ?? 5} onChange={e=>setProfile({ horizonYears: Number(e.target.value) })} />
          </label>
          <label className="flex items-center gap-2">% Épargne
            <input type="number" step="0.5" className="w-24 rounded border px-2 py-1" value={profile?.savingsRate ?? 10} onChange={e=>setProfile({ savingsRate: Number(e.target.value) })} />
          </label>
          <label className="flex items-center gap-2">Holdings (CSV)
            <input className="flex-1 rounded border px-2 py-1" value={holdingsStr} onChange={e=>setProfile({ holdings: e.target.value.split(',').map(s=>({symbol:s.trim().toUpperCase()})).filter(x=>x.symbol) })} placeholder="SPY,QQQ,AAPL…" />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded bg-blue-600 text-white px-3 py-1 text-sm" onClick={async()=>{
            if (!email) return Toasts.show('Email requis');
            localStorage.setItem('user_email', email);
            await load(email); setProfile({ email }); Toasts.show('Profil chargé');
          }}>Charger</button>
          <button className="rounded bg-emerald-600 text-white px-3 py-1 text-sm" onClick={async()=>{ if (!profile?.email && email){ setProfile({ email }); } await save(); Toasts.show('Profil enregistré'); }}>Enregistrer</button>
        </div>
      </section>

      <section className="rounded border p-3 space-y-3" id="AdviceSummary">
        <div className="font-semibold text-sm">Conseils du jour</div>
        <AdvisorChat />
      </section>

      <section className="rounded border p-3 space-y-3" id="Projections">
        <div className="font-semibold text-sm">Projections financières</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">Valeur initiale
              <input id="pv" type="number" className="w-28 rounded border px-2 py-1" defaultValue={10000}/>
            </label>
            <label className="flex items-center gap-2">Horizon (ans)
              <input id="yrs" type="number" className="w-20 rounded border px-2 py-1" defaultValue={profile?.horizonYears ?? 5}/>
            </label>
            <label className="flex items-center gap-2">Rendement annuel (%)
              <input id="ret" type="number" step="0.5" className="w-24 rounded border px-2 py-1" defaultValue={7}/>
            </label>
            <label className="flex items-center gap-2">Volatilité annuelle (%)
              <input id="vol" type="number" step="0.5" className="w-24 rounded border px-2 py-1" defaultValue={15}/>
            </label>
            <label className="flex items-center gap-2">Apport mensuel
              <input id="cont" type="number" className="w-28 rounded border px-2 py-1" defaultValue={300}/>
            </label>
            <button className="rounded bg-gray-900 text-white px-3 py-1 text-sm" onClick={()=>{
              const pv = Number((document.getElementById('pv') as HTMLInputElement).value || 0);
              const yrs = Number((document.getElementById('yrs') as HTMLInputElement).value || 5);
              const ret = Number((document.getElementById('ret') as HTMLInputElement).value || 7)/100;
              const vol = Number((document.getElementById('vol') as HTMLInputElement).value || 15)/100;
              const cont = Number((document.getElementById('cont') as HTMLInputElement).value || 0);
              setParams({ startValue: pv, years: yrs, annualReturn: ret, annualVol: vol, monthlyContribution: cont });
            }}>Mettre à jour</button>
          </div>
          <div className="md:col-span-2">
            <Projections {...params}/>
          </div>
        </div>
      </section>
    </div>
  );
}

type P = Parameters<typeof Projections>[0];
import { useMemo as _useMemo } from 'react';
function useParams(init: P){ return _useMemo(()=>init,[]); }
const _initParams:P = { startValue: 10000, years: 5, annualReturn: 0.07, annualVol: 0.15, monthlyContribution: 300 };
let params = _initParams;
function setParams(p: P){ params = p; const ev = new Event('recharts-repaint'); window.dispatchEvent(ev); }
// petit hack pour re-render Projections : wrapper (si besoin, migrer vers un vrai state si tu préfères)
