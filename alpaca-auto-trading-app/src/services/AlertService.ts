import { AIAlert, AlertRule } from '@/types';

const S = {
  rules: new Map<string, AlertRule>(),
  log: [] as AIAlert[],
};

function loadRules() {
  try { const raw = localStorage.getItem('alert_rules'); if (!raw) return;
    (JSON.parse(raw) as AlertRule[]).forEach(r => S.rules.set(r.id, r));
  } catch {}
}
function saveRules() { try { localStorage.setItem('alert_rules', JSON.stringify([...S.rules.values()])); } catch {} }

function scoreFromSignals(s: { rsi?: number; adx?: number; donchianBreak?: boolean }) {
  let score = 0;
  if (s.rsi !== undefined) score += (s.rsi < 30 ? 0.35 : s.rsi > 70 ? 0.15 : 0);
  if (s.adx !== undefined) score += (s.adx > 25 ? 0.3 : 0.05);
  if (s.donchianBreak) score += 0.35;
  return Math.min(1, score);
}

export const AlertService = {
  async addRule(rule: AlertRule): Promise<boolean> { if (typeof window !== 'undefined') loadRules(); S.rules.set(rule.id, rule); saveRules(); return true; },
  async toggleRule(id: string, enabled: boolean): Promise<boolean> { const r = S.rules.get(id); if (!r) return false; r.enabled = enabled; S.rules.set(id, r); saveRules(); return true; },
  async getRules(): Promise<AlertRule[]> { if (typeof window !== 'undefined') loadRules(); return [...S.rules.values()]; },
  async clearLog(): Promise<boolean> { S.log.length = 0; return true; },
  async getLog(): Promise<AIAlert[]> { return S.log.slice(0, 400); },
  async evaluate(symbol: string, bars: Array<{ c:number; h:number; l:number }>): Promise<boolean> {
    if (!bars || bars.length < 20) return true;
    const n = bars.length;
    const closes = bars.map(b=>b.c), highs = bars.map(b=>b.h), lows = bars.map(b=>b.l);
    let gains=0, losses=0;
    for (let i=n-15;i<n-1;i++){ const d=closes[i+1]-closes[i]; if(d>=0) gains+=d; else losses-=d; }
    const rs = losses===0 ? 100 : gains/Math.max(1e-6, losses);
    const rsi = 100 - 100/(1+rs);
    const maxH = Math.max(...highs.slice(-20)), minL = Math.min(...lows.slice(-20));
    const donchianBreak = closes[n-1] >= maxH || closes[n-1] <= minL;
    const avgRange = highs.slice(-14).reduce((a,h,i)=>a+(h-lows[n-14+i]),0)/14;
    const adxProxy = (avgRange/Math.max(1e-6, closes[n-1]))*100;

    const score = scoreFromSignals({ rsi, adx: adxProxy, donchianBreak });
    const active = [...S.rules.values()].filter(r=>r.enabled && r.symbol===symbol);
    for (const r of active) {
      const gate = typeof r.params.gate==='number' ? r.params.gate : 0.6;
      if (score >= gate) {
        S.log.unshift({ id:`${Date.now()}-${symbol}`, symbol, score, rule:r.name, ts: Date.now() });
      }
    }
    return true;
  }
};
