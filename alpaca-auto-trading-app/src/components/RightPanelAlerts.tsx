'use client';
import { useEffect, useState } from 'react';
import { AlertService } from '@/services/AlertService';
import type { AIAlert, AlertRule } from '@/types';
import { formatDateTime } from '@/lib/time';

export default function RightPanelAlerts({ symbol }: { symbol: string }) {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [log, setLog] = useState<AIAlert[]>([]);
  const [title, setTitle] = useState('RSI+Donchian');

  useEffect(()=>{ (async()=>setRules(await AlertService.getRules()))(); },[]);
  useEffect(()=>{ const id=setInterval(async()=>setLog(await AlertService.getLog()), 1200); return ()=>clearInterval(id); },[]);

  async function addRule() {
    await AlertService.addRule({ id:`r-${Date.now()}`, symbol, name:title, enabled:true, params:{ gate:0.6 } });
    setRules(await AlertService.getRules());
  }

  return (
    <aside className="w-[340px] border-l flex flex-col">
      <div className="p-3 border-b">
        <div className="text-sm font-semibold">Alerts</div>
        <div className="mt-2 flex gap-2">
          <input value={title} onChange={e=>setTitle(e.target.value)} className="flex-1 rounded border px-2 py-1 text-sm" />
          <button onClick={addRule} className="rounded bg-blue-600 px-3 py-1 text-white text-sm">Ajouter</button>
        </div>
        <div className="mt-3 space-y-2">
          {rules.length===0 && <div className="text-sm text-gray-500">Aucune règle</div>}
          {rules.map(r=>(
            <div key={r.id} className="flex items-center justify-between rounded border px-2 py-1">
              <div className="text-sm">{r.name} <span className="text-gray-500">({r.symbol})</span></div>
              <label className="text-xs flex items-center gap-1">
                <input type="checkbox" checked={r.enabled} onChange={async e=>{ await AlertService.toggleRule(r.id, e.target.checked); setRules(await AlertService.getRules()); }} />
                {r.enabled ? 'On' : 'Off'}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="font-semibold text-sm">Alert Logs</div>
          <button className="text-xs text-red-600" onClick={async()=>{ await AlertService.clearLog(); setLog(await AlertService.getLog()); }}>Vider</button>
        </div>
      </div>
      <div className="p-3 overflow-auto">
        <div className="space-y-2 max-h-[60vh]">
          {log.map(a=>(
            <div key={'id' in a ? a.id : `${a.symbol}-${a.timestamp}`} className="rounded border px-2 py-1 text-sm">
              <div className="flex justify-between">
                <div><span className="font-mono">{a.symbol}</span> · {a.rule}</div>
                <div className="text-gray-500">{(a.score*100).toFixed(0)}%</div>
              </div>
              <div className="text-xs text-gray-500">{formatDateTime('ts' in a ? a.ts : a.timestamp)}</div>
            </div>
          ))}
          {log.length===0 && <div className="text-sm text-gray-500">Aucune alerte</div>}
        </div>
      </div>
    </aside>
  );
}
