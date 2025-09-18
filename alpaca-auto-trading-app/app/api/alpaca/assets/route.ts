import { NextRequest } from 'next/server';
import { alpacaGET, AlpacaEndpoints } from '@/lib/api/alpaca';

type Asset = { id: string; symbol: string; name?: string; exchange?: string; status: string; tradable: boolean; class: string; };

const __assetsCache: { at: number; items: Asset[] } = { at: 0, items: [] };
let __assetsInflight: Promise<Asset[]> | null = null;

async function listActiveAssetsCached(): Promise<Asset[]> {
  const now = Date.now();
  if (__assetsCache.items.length && (now - __assetsCache.at) < 180_000) { // 3 minutes
    return __assetsCache.items;
  }
  if (__assetsInflight) return __assetsInflight;
  __assetsInflight = (async () => {
    try {
      const assets = await alpacaGET<Asset[]>(`${AlpacaEndpoints.assets}?status=active`);
      const filtered = assets.filter(a => a.tradable && a.class === 'us_equity');
      __assetsCache.items = filtered; __assetsCache.at = Date.now(); __assetsInflight = null; return filtered;
    } catch (error) {
      __assetsInflight = null;
      // Fallback to mock data if Alpaca API fails
      const mockSymbols = [
        { id: '1', symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', status: 'active', tradable: true, class: 'us_equity' },
        { id: '2', symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', status: 'active', tradable: true, class: 'us_equity' },
        { id: '3', symbol: 'GOOGL', name: 'Alphabet Inc. Class A', exchange: 'NASDAQ', status: 'active', tradable: true, class: 'us_equity' },
        { id: '4', symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', status: 'active', tradable: true, class: 'us_equity' },
        { id: '5', symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', status: 'active', tradable: true, class: 'us_equity' },
        { id: '6', symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', status: 'active', tradable: true, class: 'us_equity' },
        { id: '7', symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', status: 'active', tradable: true, class: 'us_equity' },
        { id: '8', symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', status: 'active', tradable: true, class: 'us_equity' },
        { id: '9', symbol: 'AMD', name: 'Advanced Micro Devices Inc.', exchange: 'NASDAQ', status: 'active', tradable: true, class: 'us_equity' },
        { id: '10', symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', status: 'active', tradable: true, class: 'us_equity' },
        { id: '11', symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE', status: 'active', tradable: true, class: 'us_equity' },
        { id: '12', symbol: 'QQQ', name: 'Invesco QQQ Trust', exchange: 'NASDAQ', status: 'active', tradable: true, class: 'us_equity' },
        { id: '13', symbol: 'IWM', name: 'iShares Russell 2000 ETF', exchange: 'NYSE', status: 'active', tradable: true, class: 'us_equity' },
        { id: '14', symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', exchange: 'NYSE', status: 'active', tradable: true, class: 'us_equity' },
        { id: '15', symbol: 'VOO', name: 'Vanguard S&P 500 ETF', exchange: 'NYSE', status: 'active', tradable: true, class: 'us_equity' },
      ];
      __assetsCache.items = mockSymbols; __assetsCache.at = Date.now();
      return mockSymbols;
    }
  })();
  return __assetsInflight;
}

export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get('q') ?? '').toUpperCase();
    const limit = Number(req.nextUrl.searchParams.get('limit') ?? 20);
    const assets = await listActiveAssetsCached();
    const items = assets
      .filter(a => !q || a.symbol.includes(q) || (a.name ?? '').toUpperCase().includes(q))
      .slice(0, limit)
      .map(a => ({ symbol: a.symbol, name: a.name ?? '', exchange: a.exchange ?? '' }));
    return Response.json({ items });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'assets_error' }), { status: 500 });
  }
}
