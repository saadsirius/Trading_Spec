'use client';
import { useState, useEffect } from 'react';
import { SystemHealth, ServiceStatus } from '@/lib/core/domain';
import { eventBus } from '@/lib/core/eventBus';
import { quoteCache, newsCache, sentimentCache } from '@/lib/core/cache';

export default function SystemHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [eventStats, setEventStats] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Update health data every 5 seconds
    const interval = setInterval(() => {
      updateHealthData();
    }, 5000);

    // Listen to system health events
    const unsubscribe = eventBus.on('SYSTEM_HEALTH_UPDATE', (event) => {
      setHealth(event.payload);
    });

    // Initial load
    updateHealthData();

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const updateHealthData = () => {
    // Simulate health data (replace with real implementation)
    const mockHealth: SystemHealth = {
      timestamp: Date.now(),
      services: {
        alpaca: {
          status: Math.random() > 0.1 ? 'healthy' : 'degraded',
          latency: Math.random() * 100 + 50,
          lastCheck: Date.now(),
          reconnectCount: Math.floor(Math.random() * 3),
        },
        websocket: {
          status: Math.random() > 0.05 ? 'healthy' : 'down',
          latency: Math.random() * 50 + 10,
          lastCheck: Date.now(),
          reconnectCount: Math.floor(Math.random() * 5),
        },
        database: {
          status: 'healthy',
          latency: Math.random() * 20 + 5,
          lastCheck: Date.now(),
        },
        cache: {
          status: 'healthy',
          latency: Math.random() * 5 + 1,
          lastCheck: Date.now(),
        },
      },
      metrics: {
        latency: {
          p50: Math.random() * 50 + 20,
          p95: Math.random() * 100 + 50,
          p99: Math.random() * 200 + 100,
        },
        throughput: {
          quotesPerSecond: Math.random() * 100 + 50,
          ordersPerMinute: Math.random() * 10 + 5,
        },
        errors: {
          total: Math.floor(Math.random() * 10),
          byType: {
            'Network': Math.floor(Math.random() * 5),
            'Validation': Math.floor(Math.random() * 3),
            'ExternalAPI': Math.floor(Math.random() * 2),
          },
        },
      },
    };

    setHealth(mockHealth);
    setCacheStats({
      quote: quoteCache.getStats(),
      news: newsCache.getStats(),
      sentiment: sentimentCache.getStats(),
    });
    setEventStats(eventBus.getStats());
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'degraded': return '🟡';
      case 'down': return '🔴';
      default: return '⚪';
    }
  };

  if (!health) {
    return (
      <div className="p-6">
        <div className="glass p-6 rounded-xl">
          <div className="animate-pulse">
            <div className="h-6 bg-white/20 rounded mb-4"></div>
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">🏥 System Health</h1>
            <p className="text-white/70">
              Monitoring en temps réel de tous les services et métriques
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm ${
              isLive ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
            }`}>
              {isLive ? '🔴 LIVE' : '⏸️ PAUSED'}
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {isLive ? 'Pause' : 'Start'} Monitoring
            </button>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(health.services).map(([service, status]) => (
          <div key={service} className="glass p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white capitalize">{service}</h3>
              <span className="text-2xl">{getStatusIcon(status.status)}</span>
            </div>
            <div className={`text-sm ${getStatusColor(status.status)}`}>
              {status.status.toUpperCase()}
            </div>
            {status.latency && (
              <div className="text-xs text-white/60 mt-1">
                Latency: {status.latency.toFixed(1)}ms
              </div>
            )}
            {status.reconnectCount && status.reconnectCount > 0 && (
              <div className="text-xs text-yellow-400 mt-1">
                Reconnects: {status.reconnectCount}
              </div>
            )}
            {status.error && (
              <div className="text-xs text-red-400 mt-1 truncate">
                {status.error}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Metrics */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">📊 Latency Metrics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">P50:</span>
              <span className="text-white font-mono">{health.metrics.latency.p50.toFixed(1)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">P95:</span>
              <span className="text-white font-mono">{health.metrics.latency.p95.toFixed(1)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">P99:</span>
              <span className="text-white font-mono">{health.metrics.latency.p99.toFixed(1)}ms</span>
            </div>
          </div>
        </div>

        {/* Throughput Metrics */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">🚀 Throughput</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Quotes/sec:</span>
              <span className="text-white font-mono">{health.metrics.throughput.quotesPerSecond.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Orders/min:</span>
              <span className="text-white font-mono">{health.metrics.throughput.ordersPerMinute.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      <div className="glass p-6 rounded-xl">
        <h2 className="text-lg font-semibold text-white mb-4">⚠️ Errors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-red-400 mb-2">
              {health.metrics.errors.total}
            </div>
            <div className="text-white/70">Total Errors</div>
          </div>
          <div className="space-y-2">
            {Object.entries(health.metrics.errors.byType).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span className="text-white/70">{type}:</span>
                <span className="text-white font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cache Statistics */}
      {cacheStats && (
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">💾 Cache Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(cacheStats).map(([cacheName, stats]: [string, any]) => (
              <div key={cacheName} className="bg-white/5 p-4 rounded-lg">
                <h3 className="font-semibold text-white capitalize mb-2">{cacheName} Cache</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Size:</span>
                    <span className="text-white">{stats.size}/{stats.maxSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Hit Rate:</span>
                    <span className="text-white">{(stats.hitRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Bus Statistics */}
      {eventStats && (
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">📡 Event Bus</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {eventStats.totalEvents}
              </div>
              <div className="text-white/70">Total Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400 mb-2">
                {eventStats.globalHandlers}
              </div>
              <div className="text-white/70">Global Handlers</div>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-white font-semibold mb-2">Handlers by Type:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {Object.entries(eventStats.handlersByType).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-white/70">{type}:</span>
                  <span className="text-white">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center text-white/50 text-sm">
        Last updated: {new Date(health.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
