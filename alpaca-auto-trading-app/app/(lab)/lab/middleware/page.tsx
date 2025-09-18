'use client';
import useSWR from 'swr';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function MiddlewareLab() {
  const { data } = useSWR('/api/gw/list', fetcher);
  
  return (
    <div className="p-5 space-y-2">
      <h1 className="text-xl font-semibold">Middleware — Plugins & Flux</h1>
      <div className="text-sm text-gray-400">
        Plugins actifs: { (data?.items || []).join(', ') || '—' }
      </div>
      
      <div className="ds-card p-3">
        <div className="text-sm mb-2">Stream Quotes (SSE)</div>
        <pre className="text-xs opacity-70">
          GET /api/stream/sse?symbols=SPY,QQQ,NVDA
        </pre>
      </div>
      
      <div className="ds-card p-3">
        <div className="text-sm mb-2">GraphQL Endpoint</div>
        <pre className="text-xs opacity-70">
          POST /api/graphql
          {`{
  quote(symbol: "AAPL") {
    symbol
    price
    change1d
  }
}`}
        </pre>
      </div>
      
      <div className="ds-card p-3">
        <div className="text-sm mb-2">Gateway Routes</div>
        <div className="text-xs space-y-1">
          <div>• GET /api/gw/alpaca/market/bars?symbols=SPY,QQQ&timeframe=1Day</div>
          <div>• POST /api/gw/alpaca/orders</div>
          <div>• POST /api/gw/ai/advisor</div>
        </div>
      </div>
    </div>
  );
}
