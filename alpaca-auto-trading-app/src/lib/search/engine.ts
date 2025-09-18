import { makeLRU } from './cache';
import { alpacaSearchSymbols, alpacaSnapshot } from './providers/alpaca';
import { enrichCompany } from './providers/enrich';

const cache = makeLRU<string, any>(200);

export type SearchResult = TickerInfo & { score: number; reason: string };

export async function searchAll(q: string): Promise<SearchResult[]> {
  const key = `q:${q.toLowerCase()}`;
  const hit = cache.get(key); 
  if (hit) return hit;
  
  const base = await alpacaSearchSymbols(q);
  const take = base.slice(0, 10);
  const out: SearchResult[] = [];
  
  for (const b of take) {
    const snap = await alpacaSnapshot(b.symbol);
    if (!snap) continue;
    const enr = await enrichCompany(b.name || b.symbol);
    const s = scoring(snap);
    out.push({ ...b, ...snap, ...enr, score: s.score, reason: s.reason });
  }
  
  out.sort((a, b) => b.score - a.score);
  cache.set(key, out);
  return out;
}

function scoring(x: TickerInfo) {
  // Score simple: momentum court + faible drawdown intraday approximé
  const last = x.spark?.at(-1) ?? x.price ?? 0;
  const first = x.spark?.[0] ?? x.price ?? 0;
  const mom = first ? (last - first) / first : 0;
  const vol = volatility(x.spark || []);
  const s = 0.6 * (x.change1w || 0) + 0.3 * mom - 0.2 * vol + 0.1 * ((x.esg?.score ?? 0.5) - 0.5);
  return { 
    score: clamp01(0.5 + s), 
    reason: `Mom:${nf(mom)} Vol:${nf(vol)} ESG:${(x.esg?.score ?? 0.5).toFixed(2)}` 
  };
}

function volatility(arr: number[]) {
  if (arr.length < 4) return 0.02;
  const r: number[] = [];
  for (let i = 1; i < arr.length; i++) { 
    r.push((arr[i] - arr[i - 1]) / (arr[i - 1] || 1)); 
  }
  const m = r.reduce((a, b) => a + b, 0) / r.length;
  const v = r.reduce((a, b) => a + (b - m) * (b - m), 0) / r.length;
  return Math.sqrt(v);
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const nf = (x: number) => (x * 100).toFixed(1) + '%';

export async function suggestions(prefix: string) {
  // Combine historique local (client) + top Alpaca (serveur)
  const list = await alpacaSearchSymbols(prefix);
  return list.slice(0, 8);
}
