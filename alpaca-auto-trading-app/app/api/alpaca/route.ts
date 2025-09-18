export async function GET() {
  return new Response(JSON.stringify({ 
    ok: true, 
    service: 'alpaca-proxy',
    timestamp: new Date().toISOString(),
    endpoints: {
      trading: '/api/alpaca/trading',
      market: '/api/alpaca/market',
      bars: '/api/alpaca/market/bars',
      quotes: '/api/alpaca/market/quotes',
      trades: '/api/alpaca/market/trades',
    }
  }), { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  });
}
