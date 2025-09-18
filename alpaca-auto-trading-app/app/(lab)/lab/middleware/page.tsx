'use client';
import useSWR from 'swr';
import StatusDashboard from '@/components/middleware/StatusDashboard';
import ConfigPanel from '@/components/middleware/ConfigPanel';
import PerformanceMetrics from '@/components/middleware/PerformanceMetrics';
import QueueMonitor from '@/components/middleware/QueueMonitor';
import APITester from '@/components/middleware/APITester';
import ErrorBoundary from '@/components/middleware/ErrorBoundary';
import SystemSummary from '@/components/middleware/SystemSummary';

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function MiddlewareLab() {
  const { data } = useSWR('/api/gw/list', fetcher);
  
  return (
    <div className="space-y-6">
      <ErrorBoundary>
        <StatusDashboard />
      </ErrorBoundary>
      
      <div className="p-5 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ErrorBoundary>
            <SystemSummary />
          </ErrorBoundary>
          <ErrorBoundary>
            <ConfigPanel />
          </ErrorBoundary>
          <ErrorBoundary>
            <PerformanceMetrics />
          </ErrorBoundary>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorBoundary>
            <QueueMonitor />
          </ErrorBoundary>
          <ErrorBoundary>
            <APITester />
          </ErrorBoundary>
        </div>
        
        <div className="space-y-4">
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
    </div>
  );
}
