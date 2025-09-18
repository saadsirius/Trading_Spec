import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { symbols } = await req.json();
    
    if (!Array.isArray(symbols)) {
      return NextResponse.json({ error: 'Expected array of symbols' }, { status: 400 });
    }

    // Simulation de backfill - remplacer par l'appel réel à Alpaca
    console.log('[MarketData] Backfilling data for symbols:', symbols);
    
    // TODO: Implémenter le backfill réel depuis Alpaca
    const mockData = symbols.map(symbol => ({
      symbol,
      candles: Array.from({ length: 100 }, (_, i) => ({
        symbol,
        open: 150 + Math.random() * 10,
        high: 155 + Math.random() * 10,
        low: 145 + Math.random() * 10,
        close: 150 + Math.random() * 10,
        volume: Math.floor(Math.random() * 1000000),
        startTs: Date.now() - (100 - i) * 60000, // 1 minute intervals
        timeframe: '1m' as const
      }))
    }));

    return NextResponse.json({ ok: true, data: mockData });
    
  } catch (e: any) {
    console.error('[MarketData] Backfill error:', e);
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 });
  }
}
