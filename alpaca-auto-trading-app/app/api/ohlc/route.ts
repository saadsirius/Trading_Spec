// app/api/ohlc/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PAPER_BASE = process.env.APCA_PAPER_BASE_URL || 'https://data.alpaca.markets/v2';
const KEY_ID = process.env.APCA_API_KEY_ID;
const SECRET = process.env.APCA_API_SECRET_KEY;

function isProd() {
  return process.env.NODE_ENV === 'production';
}

function hasKeys() {
  return Boolean(KEY_ID && SECRET);
}

function mockOHLC(symbol: string) {
  // tiny deterministic series for tests/dev
  const now = Math.floor(Date.now() / 1000);
  const bars = Array.from({ length: 60 }, (_, i) => {
    const t = now - (60 - i) * 60;
    const base = 150 + Math.sin(i / 6) * 1.5; // gentle wave
    const o = +(base + Math.random() * 0.4 - 0.2).toFixed(2);
    const h = +(o + Math.random() * 0.6).toFixed(2);
    const l = +(o - Math.random() * 0.6).toFixed(2);
    const c = +(l + Math.random() * (h - l)).toFixed(2);
    const v = Math.floor(50000 + Math.random() * 20000);
    return { t, o, h, l, c, v };
  });
  return { symbol, timeframe: '1Min', bars };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = (searchParams.get('symbol') || 'AAPL').toUpperCase();
    const timeframe = (searchParams.get('timeframe') || '1Min');

    // DEV: always mock so the app runs without keys
    if (!isProd()) {
      return NextResponse.json(mockOHLC(symbol));
    }

    // PROD: strictly paper trading — require keys
    if (!hasKeys()) {
      return NextResponse.json(
        { error: 'Alpaca paper keys not configured' },
        { status: 500 }
      );
    }

    // Alpaca Market Data v2 (paper works with same endpoint when you have entitlements)
    const from = new Date(Date.now() - 1000 * 60 * 60).toISOString(); // ~1h
    const url = `${PAPER_BASE}/stocks/${symbol}/bars?timeframe=${timeframe}&start=${from}`;

    const res = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': KEY_ID!,
        'APCA-API-SECRET-KEY': SECRET!,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      // @ts-expect-error: Next fetch options are fine at runtime
      timeout: 8000,
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: 'Alpaca error', details: txt }, { status: res.status });
    }

    const json = await res.json();
    // Normalize to your UI's expected shape: { symbol, timeframe, bars: [{t,o,h,l,c,v}] }
    const bars = (json.bars || []).map((b: any) => ({
      t: Math.floor(new Date(b.t || b.Timestamp || b.time).getTime() / 1000),
      o: +b.o, h: +b.h, l: +b.l, c: +b.c, v: +b.v,
    }));

    return NextResponse.json({ symbol, timeframe, bars });
  } catch (e: any) {
    console.error('[OHLC] error', e);
    return NextResponse.json({ error: 'Failed to fetch OHLC' }, { status: 500 });
  }
}
