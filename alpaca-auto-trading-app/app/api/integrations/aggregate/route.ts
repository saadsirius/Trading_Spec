import { NextRequest } from 'next/server';
import { macroNow, newsNow, weatherSignal } from '@/lib/integrations/providers';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, symbols = ['SPY', 'QQQ'], lat = 40.71, lon = -74.0 } = body || {};
  
  // Marché (réutilise ton endpoint interne agrégé)
  const agg = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/market/aggregate`, {
    method: 'POST', 
    headers: { 'content-type': 'application/json' }, 
    body: JSON.stringify({ symbols, timeframe: '1Day', limit: 120 })
  }).then(r => r.json()).catch(() => ({ agg: {} }));
  
  const [macro, news, weather] = await Promise.all([
    macroNow('US'), 
    newsNow('markets'), 
    weatherSignal(lat, lon)
  ]);
  
  return Response.json({ 
    email, 
    symbols, 
    market: agg.agg ?? {}, 
    macro, 
    news, 
    weather 
  });
}
