import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const OrderSchema = z.object({
  symbol: z.string().min(1),
  side: z.enum(['buy','sell']),
  qty: z.number().positive(),
  type: z.enum(['market','limit','stop','stop_limit']),
  limitPrice: z.number().positive().optional(),
  stopPrice: z.number().positive().optional(),
  timeInForce: z.enum(['day','gtc','opg','cls','ioc','fok']).default('day'),
  clientOrderId: z.string().optional(),
  mode: z.enum(['paper','live']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OrderSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        ok: false, 
        error: parsed.error.flatten() 
      }, { status: 400 });
    }

    const { mode, ...payload } = parsed.data;
    
    // Simulation pour le développement - remplacer par l'appel Alpaca réel
    const base = mode === 'paper' 
      ? process.env.ALPACA_PAPER_URL || 'https://paper-api.alpaca.markets'
      : process.env.ALPACA_LIVE_URL || 'https://api.alpaca.markets';
    
    // Pour l'instant, on simule une réponse réussie
    // TODO: Implémenter l'appel réel à Alpaca
    /*
    const r = await fetch(`${base}/v2/orders`, {
      method: 'POST',
      headers: {
        'APCA-API-KEY-ID': process.env.APCA_API_KEY_ID!,
        'APCA-API-SECRET-KEY': process.env.APCA_API_SECRET_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: payload.symbol,
        side: payload.side,
        qty: payload.qty,
        type: payload.type,
        time_in_force: payload.timeInForce,
        limit_price: payload.limitPrice,
        stop_price: payload.stopPrice,
        client_order_id: payload.clientOrderId,
      }),
      cache: 'no-store',
    });

    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json({ ok: false, error: text }, { status: 502 });
    }
    const data = await r.json();
    */
    
    // Simulation de réponse
    const data = {
      id: crypto.randomUUID(),
      symbol: payload.symbol,
      side: payload.side,
      qty: payload.qty,
      type: payload.type,
      status: 'new',
      created_at: new Date().toISOString()
    };

    return NextResponse.json({ ok: true, data });
    
  } catch (e: any) {
    const msg = e?.message ?? 'Unknown error';
      return NextResponse.json({
      ok: false, 
      error: msg 
    }, { status: 500 });
  }
}