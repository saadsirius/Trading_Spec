'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function SystemSummary() {
  const { data: health, error: healthError } = useSWR('/api/health', fetcher);
  const { data: plugins } = useSWR('/api/gw/list', fetcher);
  
  const [uptime, setUptime] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getSystemStatus = () => {
    if (healthError) return { status: 'error', color: 'text-rose-400', icon: '❌' };
    if (!health) return { status: 'loading', color: 'text-yellow-400', icon: '⏳' };
    if (health.status === 'healthy') return { status: 'healthy', color: 'text-emerald-400', icon: '✅' };
    return { status: 'unhealthy', color: 'text-rose-400', icon: '⚠️' };
  };

  const systemStatus = getSystemStatus();

  return (
    <div className="ds-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">System Summary</h3>
        <div className={`flex items-center gap-1 ${systemStatus.color}`}>
          <span>{systemStatus.icon}</span>
          <span className="text-xs capitalize">{systemStatus.status}</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Core Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400">Uptime</div>
            <div className="text-sm font-semibold text-blue-400">
              {formatUptime(uptime)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Active Plugins</div>
            <div className="text-sm font-semibold text-purple-400">
              {plugins?.items?.length || 0}
            </div>
          </div>
        </div>

        {/* Service Status */}
        {health && (
          <div className="pt-3 border-t border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Services</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Redis</span>
                <span className={health.services.redis === 'ok' ? 'text-emerald-400' : 'text-rose-400'}>
                  {health.services.redis === 'ok' ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cache</span>
                <span className={health.services.cache === 'ok' ? 'text-emerald-400' : 'text-rose-400'}>
                  {health.services.cache === 'ok' ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Alpaca</span>
                <span className={health.environment.hasAlpaca ? 'text-emerald-400' : 'text-rose-400'}>
                  {health.environment.hasAlpaca ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>OpenAI</span>
                <span className={health.environment.hasOpenAI ? 'text-emerald-400' : 'text-rose-400'}>
                  {health.environment.hasOpenAI ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Performance Indicators */}
        {health && (
          <div className="pt-3 border-t border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Performance</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Response Time</span>
                <span className="text-emerald-400">{health.responseTime}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Environment</span>
                <span className="text-blue-400 capitalize">{health.environment.nodeEnv}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => window.open('/api/health', '_blank')}
              className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
            >
              Health Check
            </button>
            <button
              onClick={() => window.open('/api/graphql', '_blank')}
              className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
            >
              GraphQL Playground
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
