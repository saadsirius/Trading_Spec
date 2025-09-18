'use client';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type HealthStatus = {
  status: string;
  timestamp: string;
  responseTime: string;
  services: {
    redis: string;
    cache: string;
  };
  environment: {
    nodeEnv: string;
    hasRedis: boolean;
    hasAlpaca: boolean;
    hasOpenAI: boolean;
  };
};

type PluginInfo = {
  items: string[];
};

export default function StatusDashboard() {
  const { data: health, error: healthError } = useSWR<HealthStatus>('/api/health', fetcher, {
    refreshInterval: 30000
  });
  
  const { data: plugins, error: pluginError } = useSWR<PluginInfo>('/api/gw/list', fetcher, {
    refreshInterval: 60000
  });

  const [sseStatus, setSseStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [sseMessages, setSseMessages] = useState<any[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/stream/sse?symbols=SPY,QQQ');
    
    setSseStatus('connecting');
    
    eventSource.onopen = () => {
      setSseStatus('connected');
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setSseMessages(prev => [data, ...prev.slice(0, 9)]);
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };
    
    eventSource.onerror = () => {
      setSseStatus('disconnected');
    };
    
    return () => {
      eventSource.close();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-emerald-400';
      case 'unhealthy': return 'text-rose-400';
      default: return 'text-yellow-400';
    }
  };

  const getSseStatusColor = () => {
    switch (sseStatus) {
      case 'connected': return 'text-emerald-400';
      case 'connecting': return 'text-yellow-400';
      case 'disconnected': return 'text-rose-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-5 space-y-4">
      <h1 className="text-xl font-semibold">Middleware Status Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Health Status */}
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold mb-3">System Health</h3>
          {healthError ? (
            <div className="text-rose-400 text-sm">Error loading health status</div>
          ) : health ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <span className={`text-sm font-semibold ${getStatusColor(health.status)}`}>
                  {health.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Time</span>
                <span className="text-sm text-gray-400">{health.responseTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Redis</span>
                <span className={`text-sm ${health.services.redis === 'ok' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {health.services.redis}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cache</span>
                <span className={`text-sm ${health.services.cache === 'ok' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {health.services.cache}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Loading...</div>
          )}
        </div>

        {/* Plugins Status */}
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold mb-3">Active Plugins</h3>
          {pluginError ? (
            <div className="text-rose-400 text-sm">Error loading plugins</div>
          ) : plugins ? (
            <div className="space-y-2">
              {plugins.items.length > 0 ? (
                plugins.items.map(plugin => (
                  <div key={plugin} className="flex items-center justify-between">
                    <span className="text-sm">{plugin}</span>
                    <span className="text-emerald-400 text-sm">●</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm">No plugins loaded</div>
              )}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Loading...</div>
          )}
        </div>

        {/* SSE Status */}
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold mb-3">Real-time Stream</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <span className={`text-sm font-semibold ${getSseStatusColor()}`}>
                {sseStatus}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Messages</span>
              <span className="text-sm text-gray-400">{sseMessages.length}</span>
            </div>
            {sseMessages.length > 0 && (
              <div className="text-xs text-gray-400">
                Last: {new Date().toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Environment Info */}
      {health && (
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold mb-3">Environment</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Node Env</div>
              <div className="font-mono">{health.environment.nodeEnv}</div>
            </div>
            <div>
              <div className="text-gray-400">Redis</div>
              <div className={health.environment.hasRedis ? 'text-emerald-400' : 'text-rose-400'}>
                {health.environment.hasRedis ? 'Connected' : 'Not configured'}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Alpaca</div>
              <div className={health.environment.hasAlpaca ? 'text-emerald-400' : 'text-rose-400'}>
                {health.environment.hasAlpaca ? 'Configured' : 'Not configured'}
              </div>
            </div>
            <div>
              <div className="text-gray-400">OpenAI</div>
              <div className={health.environment.hasOpenAI ? 'text-emerald-400' : 'text-rose-400'}>
                {health.environment.hasOpenAI ? 'Configured' : 'Not configured'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent SSE Messages */}
      {sseMessages.length > 0 && (
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold mb-3">Recent Price Updates</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {sseMessages.map((msg, index) => (
              <div key={index} className="text-xs font-mono bg-gray-800 p-2 rounded">
                <div className="text-gray-400 mb-1">
                  {new Date().toLocaleTimeString()}
                </div>
                <pre className="text-emerald-400">
                  {JSON.stringify(msg, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
