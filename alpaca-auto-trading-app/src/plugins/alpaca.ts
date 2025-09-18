import { Provider } from './index';
import { AlpacaBarsQ } from '@/src/mw/validate';
import { cacheGet, cacheSet } from '@/src/lib/cache/redis';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || '';

export const alpacaProvider: Provider = {
  id: 'alpaca',
  handles: (p) => p.startsWith('/market/') || p.startsWith('/orders'),
  async exec(req) {
    const url = new URL(req.url);
    const path = url.pathname.replace('/api/gw/alpaca', '');
    
    // Caching côté bars
    if (path.startsWith('/market/bars')) {
      const params = Object.fromEntries(url.searchParams.entries());
      const parsed = AlpacaBarsQ.parse(params);
      const key = `bars:${parsed.symbols}:${parsed.timeframe}:${parsed.limit}`;
      const hit = await cacheGet<any>(key);
      if (hit) return Response.json(hit, { headers: { 'x-cache': 'hit' } });
      
      const r = await fetch(
        `${BASE}/api/alpaca/market/bars?symbols=${parsed.symbols}&timeframe=${parsed.timeframe}&limit=${parsed.limit}`, 
        { cache: 'no-store' }
      );
      const j = await r.json();
      await cacheSet(key, j, 60); // TTL 60s
      return Response.json(j, { headers: { 'x-cache': 'miss' } });
    }
    
    // Pass-through pour /orders (paper/live) → tes routes internes
    const r = await fetch(
      `${BASE}/api/alpaca${path}${url.search}`, 
      { 
        method: req.method, 
        headers: req.headers, 
        body: req.body as any 
      }
    );
    return new Response(r.body, { status: r.status, headers: r.headers });
  }
};
