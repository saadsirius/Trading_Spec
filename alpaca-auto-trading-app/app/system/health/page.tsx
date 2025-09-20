// FILE: app/system/health/page.tsx
// Client-only, SSR-safe System Health dashboard with live toggle, safe fallbacks,
// testing hooks, and minimal deps (works even if domain/eventBus/cache aren't wired yet).

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* -------------------------------------------------------------------------- */
/*                               Local type defs                               */
/*  If you already have these under '@/lib/core/domain', delete this section   */
/*  and import from your real types instead.                                   */
/* -------------------------------------------------------------------------- */
type HealthStatus = 'healthy' | 'degraded' | 'down';

type ServiceStatus = {
  status: HealthStatus;
  latency?: number;       // ms
  lastCheck: number;      // ts
  reconnectCount?: number;
  error?: string;
};

type SystemHealth = {
  timestamp: number;
  services: {
    alpaca: ServiceStatus;
    websocket: ServiceStatus;
    database: ServiceStatus;
    cache: ServiceStatus;
    [k: string]: ServiceStatus;
  };
  metrics: {
    latency: { p50: number; p95: number; p99: number };
    throughput: { quotesPerSecond: number; ordersPerMinute: number };
    errors: { total: number; byType: Record<string, number> };
  };
};

/* -------------------------------------------------------------------------- */
/*                            Optional runtime fallbacks                       */
/* -------------------------------------------------------------------------- */
// eventBus fallback (compatible with .on/.off/.emit/getStats)
const eventBus =
  (typeof window !== 'undefined' && (window as any).__eventBus__) ||
  (() => {
    type Handler = (event: any) => void;
    const map = new Map<string, Set<Handler>>();
    const stats = { totalEvents: 0, globalHandlers: 0, handlersByType: {} as Record<string, number> };
    return {
      on(type: string, handler: Handler) {
        if (!map.has(type)) map.set(type, new Set());
        map.get(type)!.add(handler);
        stats.globalHandlers = Array.from(map.values()).reduce((a, s) => a + s.size, 0);
        stats.handlersByType[type] = (stats.handlersByType[type] || 0) + 1;
        return () => this.off(type, handler);
      },
      off(type: string, handler: Handler) {
        map.get(type)?.delete(handler);
        stats.globalHandlers = Array.from(map.values()).reduce((a, s) => a + s.size, 0);
        stats.handlersByType[type] = Math.max((stats.handlersByType[type] || 1) - 1, 0);
      },
      emit(type: string, payload: any) {
        stats.totalEvents += 1;
        map.get(type)?.forEach((h) => h({ type, payload, ts: Date.now() }));
      },
      getStats() {
        return { ...stats };
      },
    };
  })();

// cache fallbacks (compatible with .getStats)
const mkCache = () => {
  const state = { size: 0, maxSize: 1000, hits: 0, misses: 0 };
  return {
    getStats() {
      const total = state.hits + state.misses || 1;
      return {
        size: state.size,
        maxSize: state.maxSize,
        hitRate: state.hits / total,
      };
    },
  };
};

const quoteCache =
  (typeof window !== 'undefined' && (window as any).__quoteCache__) || mkCache();
const newsCache =
  (typeof window !== 'undefined' && (window as any).__newsCache__) || mkCache();
const sentimentCache =
  (typeof window !== 'undefined' && (window as any).__sentimentCache__) || mkCache();

/* -------------------------------------------------------------------------- */
/*                              Utility helpers                                */
/* -------------------------------------------------------------------------- */
const statusColor = (s: HealthStatus) =>
  s === 'healthy' ? 'text-green-400' : s === 'degraded' ? 'text-yellow-400' : 'text-red-400';
const statusIcon = (s: HealthStatus) => (s === 'healthy' ? '🟢' : s === 'degraded' ? '🟡' : '🔴');

const clamp = (n: number, min = 0, max = Number.POSITIVE_INFINITY) =>
  Math.max(min, Math.min(max, n));

/* -------------------------------------------------------------------------- */
/*                              Mock data builder                              */
/*   Replace with real API calls / server actions when wiring your backend.    */
/* -------------------------------------------------------------------------- */
function buildMockHealth(): SystemHealth {
  const jitter = (base: number, spread: number) => base + Math.random() * spread;
  const pick = <T,>(opts: T[], p: number[]) => {
    const r = Math.random();
    let acc = 0;
    for (let i = 0; i < opts.length; i++) {
      acc += p[i];
      if (r < acc) return opts[i];
    }
    return opts[opts.length - 1];
  };

  const maybeError = () => (Math.random() < 0.05 ? 'Transient network error' : undefined);

  const alpaca: ServiceStatus = {
    status: pick(['healthy', 'degraded'] as HealthStatus[], [0.85, 0.15]),
    latency: jitter(60, 90),
    lastCheck: Date.now(),
    reconnectCount: Math.floor(Math.random() * 2),
    error: maybeError(),
  };

  const websocket: ServiceStatus = {
    status: pick(['healthy', 'degraded', 'down'] as HealthStatus[], [0.9, 0.08, 0.02]),
    latency: jitter(15, 35),
    lastCheck: Date.now(),
    reconnectCount: Math.floor(Math.random() * 5),
    error: maybeError(),
  };

  const database: ServiceStatus = {
    status: 'healthy',
    latency: jitter(7, 15),
    lastCheck: Date.now(),
  };

  const cache: ServiceStatus = {
    status: 'healthy',
    latency: jitter(1, 3),
    lastCheck: Date.now(),
  };

  const p50 = clamp(jitter(25, 35));
  const p95 = clamp(p50 + jitter(40, 80));
  const p99 = clamp(p95 + jitter(40, 120));

  const quotesPerSecond = clamp(jitter(80, 120));
  const ordersPerMinute = clamp(jitter(6, 10));

  const errorsByType = {
    Network: Math.floor(Math.random() * 4),
    Validation: Math.floor(Math.random() * 3),
    ExternalAPI: Math.floor(Math.random() * 2),
  };
  const errorsTotal = Object.values(errorsByType).reduce((a, b) => a + b, 0);

  return {
    timestamp: Date.now(),
    services: { alpaca, websocket, database, cache },
    metrics: {
      latency: { p50, p95, p99 },
      throughput: { quotesPerSecond, ordersPerMinute },
      errors: { total: errorsTotal, byType: errorsByType },
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                Page component                               */
/* -------------------------------------------------------------------------- */
export default function SystemHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [cacheStats, setCacheStats] = useState<null | {
    quote: any;
    news: any;
    sentiment: any;
  }>(null);
  const [eventStats, setEventStats] = useState<any>(null);
  const [isLive, setIsLive] = useState<boolean>(true);

  // Guarded interval ref so we can pause/resume without remounting.
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(() => {
    // TODO: replace this with a fetch to your real health endpoint
    const next = buildMockHealth();
    setHealth(next);

    setCacheStats({
      quote: safeGetStats(quoteCache),
      news: safeGetStats(newsCache),
      sentiment: safeGetStats(sentimentCache),
    });

    setEventStats(safeGetEventStats());
    // Broadcast for any other listeners
    eventBus.emit('SYSTEM_HEALTH_UPDATE', next);
  }, []);

  // Subscribe to external health updates (if any)
  useEffect(() => {
    const off = eventBus.on('SYSTEM_HEALTH_UPDATE', (ev: any) => {
      setHealth(ev.payload as SystemHealth);
    });
    return () => off();
  }, []);

  // Live polling control
  useEffect(() => {
    // Always do an immediate refresh when toggling
    refresh();

    if (isLive) {
      intervalRef.current && clearInterval(intervalRef.current);
      intervalRef.current = setInterval(refresh, 5000);
    } else {
      intervalRef.current && clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, [isLive, refresh]);

  // Derived UI helpers
  const serviceEntries = useMemo(
    () => (health ? Object.entries(health.services) : []),
    [health]
  );

  if (!health) {
    return (
      <div className="p-6">
        <div className="glass p-6 rounded-xl" data-testid="health-skeleton">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-white/20 rounded w-1/3" />
            <div className="h-4 bg-white/20 rounded" />
            <div className="h-4 bg-white/20 rounded w-2/3" />
            <div className="h-4 bg-white/20 rounded w-1/2" />
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
            <h1 className="text-2xl font-bold text-white mb-1">🏥 System Health</h1>
            <p className="text-white/70">
              Monitoring en temps réel de tous les services et métriques
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                isLive ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
              }`}
              aria-live="polite"
            >
              {isLive ? '🔴 LIVE' : '⏸️ PAUSED'}
            </div>
            <button
              onClick={() => setIsLive((v) => !v)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              data-testid="toggle-live"
            >
              {isLive ? 'Pause' : 'Start'} Monitoring
            </button>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        data-testid="services-grid"
      >
        {serviceEntries.map(([service, s]) => (
          <div key={service} className="glass p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white capitalize">{service}</h3>
              <span className="text-2xl" aria-label={`status-${service}`}>
                {statusIcon(s.status)}
              </span>
            </div>
            <div className={`text-sm ${statusColor(s.status)}`}>{s.status.toUpperCase()}</div>
            {typeof s.latency === 'number' && (
              <div className="text-xs text-white/60 mt-1">
                Latency: {s.latency.toFixed(1)}ms
              </div>
            )}
            {typeof s.reconnectCount === 'number' && s.reconnectCount > 0 && (
              <div className="text-xs text-yellow-400 mt-1">Reconnects: {s.reconnectCount}</div>
            )}
            {s.error && (
              <div className="text-xs text-red-400 mt-1 truncate" title={s.error}>
                {s.error}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">📊 Latency Metrics</h2>
          <div className="space-y-3">
            <MetricRow label="P50" value={`${health.metrics.latency.p50.toFixed(1)} ms`} />
            <MetricRow label="P95" value={`${health.metrics.latency.p95.toFixed(1)} ms`} />
            <MetricRow label="P99" value={`${health.metrics.latency.p99.toFixed(1)} ms`} />
          </div>
        </div>

        {/* Throughput */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">🚀 Throughput</h2>
          <div className="space-y-3">
            <MetricRow
              label="Quotes/sec"
              value={health.metrics.throughput.quotesPerSecond.toFixed(1)}
            />
            <MetricRow
              label="Orders/min"
              value={health.metrics.throughput.ordersPerMinute.toFixed(1)}
            />
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
                <span className="text-white font-mono">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cache Statistics */}
      {cacheStats && (
        <div className="glass p-6 rounded-xl" data-testid="cache-stats">
          <h2 className="text-lg font-semibold text-white mb-4">💾 Cache Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(cacheStats).map(([name, stats]) => (
              <div key={name} className="bg-white/5 p-4 rounded-lg">
                <h3 className="font-semibold text-white capitalize mb-2">{name} Cache</h3>
                <div className="space-y-1 text-sm">
                  <Row label="Size" value={`${stats.size}/${stats.maxSize}`} />
                  <Row label="Hit Rate" value={`${(stats.hitRate * 100).toFixed(1)}%`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Bus Stats */}
      {eventStats && (
        <div className="glass p-6 rounded-xl" data-testid="event-stats">
          <h2 className="text-lg font-semibold text-white mb-4">📡 Event Bus</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatKpi label="Total Events" value={eventStats.totalEvents} color="text-blue-400" />
            <StatKpi
              label="Global Handlers"
              value={eventStats.globalHandlers}
              color="text-green-400"
            />
          </div>
          <div className="mt-4">
            <h3 className="text-white font-semibold mb-2">Handlers by Type</h3>
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

      {/* Footer */}
      <div className="text-center text-white/50 text-sm" data-testid="last-updated">
        Last updated: {new Date(health.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Small UI helpers                               */
/* -------------------------------------------------------------------------- */
function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/70">{label}:</span>
      <span className="text-white font-mono">{value}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/70">{label}:</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

function StatKpi({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className={`text-2xl font-bold ${color || 'text-white'} mb-2`}>{value}</div>
      <div className="text-white/70">{label}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Safe getter utils                              */
/* -------------------------------------------------------------------------- */
function safeGetStats(cacheLike: any) {
  try {
    const s = cacheLike?.getStats?.();
    if (!s) throw new Error('No stats');
    return {
      size: Number(s.size ?? 0),
      maxSize: Number(s.maxSize ?? 0),
      hitRate: Number.isFinite(s.hitRate) ? s.hitRate : 0,
    };
  } catch {
    return { size: 0, maxSize: 0, hitRate: 0 };
  }
}

function safeGetEventStats() {
  try {
    const s = (eventBus as any)?.getStats?.();
    if (!s) throw new Error('No event stats');
    return {
      totalEvents: Number(s.totalEvents ?? 0),
      globalHandlers: Number(s.globalHandlers ?? 0),
      handlersByType: s.handlersByType || {},
    };
  } catch {
    return { totalEvents: 0, globalHandlers: 0, handlersByType: {} };
  }
}