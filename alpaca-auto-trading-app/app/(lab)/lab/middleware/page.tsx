'use client';
import useSWR from 'swr';
import StatusDashboard from '@/src/components/middleware/StatusDashboard';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function MiddlewareLab() {
  const { data } = useSWR('/api/gw/list', fetcher);
  
  return (
    <div className="space-y-6">
      <StatusDashboard />
      
      <div className="p-5 space-y-4">
        <h2 className="text-lg font-semibold">API Documentation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div className="ds-card p-3">
            <div className="text-sm mb-2">Search APIs</div>
            <div className="text-xs space-y-1">
              <div>• GET /api/search?q=AAPL</div>
              <div>• GET /api/search/suggest?q=AAP</div>
              <div>• GET /api/health</div>
            </div>
          </div>
        </div>
        
        <div className="ds-card p-3">
          <div className="text-sm mb-2">Active Plugins</div>
          <div className="text-sm text-gray-400">
            { (data?.items || []).join(', ') || '—' }
          </div>
        </div>
      </div>
    </div>
  );
}
