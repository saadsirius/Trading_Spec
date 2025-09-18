const BASE = process.env.NEXT_PUBLIC_BASE_URL || '';

type Bar = { c: number; h: number; l: number; t: number };

export type TickerInfo = {
  symbol: string; 
  name?: string; 
  type: 'stock' | 'etf' | 'crypto' | 'index';
  price?: number; 
  change1d?: number; 
  change1w?: number; 
  change1m?: number;
  volumeAvg?: number; 
  marketCap?: number; 
  pe?: number; 
  dividendYield?: number;
  esg?: { score?: number, grade?: string }; // stub
  logoUrl?: string; 
  sector?: string;
  spark?: number[];
};

export async function alpacaSearchSymbols(q: string) {
  // Utilise ta route existante de "assets" côté serveur si dispo; fallback: bars ping
  const url = `${BASE}/api/alpaca/assets?query=${encodeURIComponent(q)}&limit=15`;
  try {
    const j = await fetch(url, { cache: 'no-store' }).then(r => r.json());
    // normalise: [{ symbol, name, class }]
    return (j.items || j.assets || []).map((a: any) => ({ 
      symbol: a.symbol, 
      name: a.name, 
      type: guessType(a) as any 
    }));
  } catch { 
    return []; 
  }
}

function guessType(a: any) {
  const c = (a?.asset_class || a?.class || 'us_equity').toLowerCase();
  if (c.includes('crypto')) return 'crypto';
  if (a?.symbol?.endsWith('.X')) return 'crypto';
  return 'stock';
}

export async function alpacaSnapshot(symbol: string): Promise<TickerInfo | null> {
  try {
    // 1) prix courant + bars historiques (pour variations multi-horizons)
    const bars = await fetch(`${BASE}/api/alpaca/market/bars?symbols=${symbol}&timeframe=1Day&limit=60`, { cache: 'no-store' }).then(r => r.json());
    const arr: Bar[] = bars?.bars?.[symbol] || [];
    if (!arr.length) return { symbol, type: 'stock' };
    
    const price = arr.at(-1)!.c;
    const close1d = arr.at(-2)?.c ?? price;
    const close1w = arr.at(-6)?.c ?? price;
    const close1m = arr.at(-21)?.c ?? price;
    const pct = (a: number, b: number) => (a - b) / (b || 1);
    const spark = arr.slice(-40).map(b => b.c);
    
    return {
      symbol, 
      type: 'stock', 
      price,
      change1d: pct(price, close1d), 
      change1w: pct(price, close1w), 
      change1m: pct(price, close1m),
      spark
    };
  } catch { 
    return null; 
  }
}

export async function alpacaIntradaySpark(symbol: string) {
  try {
    const j = await fetch(`${BASE}/api/alpaca/market/bars?symbols=${symbol}&timeframe=5Min&limit=80`, { cache: 'no-store' }).then(r => r.json());
    return j?.bars?.[symbol]?.map((b: Bar) => b.c) || [];
  } catch { 
    return []; 
  }
}
