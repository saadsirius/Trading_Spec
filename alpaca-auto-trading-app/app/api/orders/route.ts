import { NextResponse } from 'next/server';

let ORDERS: any[] = [];

export async function GET() {
  return NextResponse.json(ORDERS);
}

export async function POST(req: Request) {
  const body = await req.json();
  const order = {
    id: crypto.randomUUID(),
    client_order_id: body.client_order_id ?? crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    submitted_at: new Date().toISOString(),
    filled_qty: '0',
    order_class: 'simple',
    order_type: body.type ?? 'market',
    type: body.type ?? 'market',
    side: body.side ?? 'buy',
    time_in_force: body.time_in_force ?? 'day',
    limit_price: body.limit_price ?? undefined,
    stop_price: body.stop_price ?? undefined,
    status: 'new',
    qty: body.qty ?? '1',
    symbol: body.symbol ?? 'AAPL',
    asset_id: 'mock',
    asset_class: 'us_equity',
  };
  ORDERS.unshift(order);
  return NextResponse.json({ success: true, data: order });
}