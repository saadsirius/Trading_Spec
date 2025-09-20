'use client';

/**
 * MyDashboard (React Query edition)
 * - Per-panel queries with independent refetch
 * - SSR-safe (client-only), timeouts, mock fallbacks
 * - Paper mode badge, tabs, KPIs, equity chart, watchlist, signals, trades
 * - Test hooks via data-testid
 */

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';

// ───────────────────────────────────────────────────────── Types
type Mode = 'paper' | 'live';
type SignalType = 'BUY' | 'SELL';
interface Instrument {
  id: string; symbol: string; name: string; type: string;
  sector?: string; price: number; changePercent: number; sparkline?: number[];
}
interface Position {
  id: string; symbol: string; side: 'long' | 'short'; qty: number;
  avgPrice: number; marketValue: number; unrealizedPL: number;
}
interface Trade {
  id: string; symbol: string; side: 'buy' | 'sell'; qty: number; price: number; ts: string;
}
interface PortfolioDay { date: string; totalValue: number; dayChange?: number; }
interface Signal {
  id: string; symbol: string; name?: string; signalType: SignalType;
  strength: number; confidence: number; riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  currentPrice?: number; priceChange?: number; reasoning?: string[]; stopLoss?: number; takeProfit?: number;
}

// ───────────────────────────────────────────────────────── Utils
const fmtUsd = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const fmtPct = (n: number, d = 2) => `${n >= 0 ? '+' : ''}${n.toFixed(d)}%`;

async function fetchJSON<T>(url: string, timeout = 6000): Promise<T> {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(tid);
  }
}

// ───────────────────────────────────────────────────────── Mocks (fallback)
const mockInstruments: Instrument[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', type: 'STOCK', price: 187.21, changePercent: 1.23, sparkline: [180,183,182,185,187] },
  { id: '2', symbol: 'MSFT', name: 'Microsoft',   type: 'STOCK', price: 412.10, changePercent: -0.42, sparkline: [420,418,415,413,412] },
  { id: '3', symbol: 'NVDA', name: 'NVIDIA',      type: 'STOCK', price: 816.32, changePercent: 2.14, sparkline: [790,800,805,810,816] },
  { id: '4', symbol: 'TLT',  name: 'Treasury 20+',type: 'ETF',   price: 93.50,  changePercent: 0.35, sparkline: [92,92.3,92.9,93.2,93.5] },
];

const mockCurve: PortfolioDay[] = Array.from({ length: 30 }, (_, i, arr) => {
  const base = 100_000, drift = i * 120, noise = Math.sin(i / 3) * 180;
  const totalValue = Math.round(base + drift + noise);
  const date = new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10);
  const prev = i ? Math.round(base + (i - 1) * 120 + Math.sin((i - 1) / 3) * 180) : totalValue;
  return { date, totalValue, dayChange: totalValue - prev };
});

const mockPositions: Position[] = [
  { id: 'p1', symbol: 'AAPL', side: 'long', qty: 50, avgPrice: 175, marketValue: 9360.5, unrealizedPL: 612.5 },
  { id: 'p2', symbol: 'NVDA', side: 'long', qty: 8,  avgPrice: 700, marketValue: 6530.56, unrealizedPL: 933.12 },
];

const mockTrades: Trade[] = [
  { id: 't1', symbol: 'AAPL', side: 'buy',  qty: 20, price: 182.12, ts: new Date().toISOString() },
  { id: 't2', symbol: 'NVDA', side: 'sell', qty: 4,  price: 812.00, ts: new Date(Date.now() - 3600000).toISOString() },
  { id: 't3', symbol: 'MSFT', side: 'buy',  qty: 5,  price: 410.50, ts: new Date(Date.now() - 7200000).toISOString() },
];

const mockSignals: Signal[] = [
  { id: 's1', symbol: 'AAPL', name: 'Apple',  signalType: 'BUY',  strength: 72, confidence: 64, riskLevel: 'LOW',    currentPrice: 187.21, priceChange: 1.23, reasoning: ['Golden cross','RSI 48→56'], stopLoss: 178.5, takeProfit: 196.0 },
  { id: 's2', symbol: 'NVDA', name: 'NVIDIA', signalType: 'SELL', strength: 61, confidence: 58, riskLevel: 'MEDIUM', currentPrice: 816.32, priceChange: 2.14, reasoning: ['Overbought (RSI 72)'] },
];

// ───────────────────────────────────────────────────────── Queries
function useDiscoverQuery() {
  return useQuery({
    queryKey: ['discover', { limit: 50 }],
    queryFn: async () => {
      try {
        const res = await fetchJSON<{ instruments: Instrument[] }>('/api/discover?limit=50');
        return res.instruments ?? mockInstruments;
      } catch {
        return mockInstruments;
      }
    },
  });
}

function usePortfolioQuery(mode: Mode) {
  return useQuery({
    queryKey: ['portfolio', { userId: 'demo', mode }],
    queryFn: async () => {
      try {
        const res = await fetchJSON<{ portfolioData: PortfolioDay[]; currentPositions?: Position[] }>(`/api/portfolio?userId=demo&mode=${mode}`);
        return {
          curve: res.portfolioData ?? mockCurve,
          positions: res.currentPositions ?? mockPositions,
        };
      } catch {
        return { curve: mockCurve, positions: mockPositions };
      }
    },
  });
}

function useSignalsQuery() {
  return useQuery({
    queryKey: ['signals', { userId: 'demo', limit: 10 }],
    queryFn: async () => {
      try {
        const res = await fetchJSON<{ signals: Signal[] }>('/api/signals?userId=demo&limit=10');
        return res.signals ?? mockSignals;
      } catch {
        return mockSignals;
      }
    },
  });
}

function useTradesQuery() {
  return useQuery({
    queryKey: ['trades', { limit: 20 }],
    queryFn: async () => {
      try {
        const res = await fetchJSON<Trade[]>('/api/trades?limit=20');
        return Array.isArray(res) ? res : mockTrades;
      } catch {
        return mockTrades;
      }
    },
  });
}

// ───────────────────────────────────────────────────────── Page
export default function MyDashboardRQ() {
  const [mode] = useState<Mode>('paper'); // force paper
  const [tab, setTab] = useState<'overview'|'portfolio'|'signals'|'activity'>('overview');
  const qc = useQueryClient();

  const { data: instruments = [], isLoading: loadingDiscover, refetch: refetchDiscover, isFetching: fetchingDiscover } = useDiscoverQuery();
  const { data: portfolio, isLoading: loadingPortfolio, refetch: refetchPortfolio, isFetching: fetchingPortfolio } = usePortfolioQuery(mode);
  const { data: signals = [], isLoading: loadingSignals, refetch: refetchSignals, isFetching: fetchingSignals } = useSignalsQuery();
  const { data: trades = [], isLoading: loadingTrades, refetch: refetchTrades, isFetching: fetchingTrades } = useTradesQuery();

  const curve = portfolio?.curve ?? [];
  const positions = portfolio?.positions ?? [];

  const equityNow = curve.length ? curve[curve.length - 1].totalValue : 0;
  const dayChange = curve.length > 1 ? equityNow - curve[curve.length - 2].totalValue : 0;
  const dayChangePct = curve.length > 1 && curve[curve.length - 2].totalValue > 0
    ? (dayChange / curve[curve.length - 2].totalValue) * 100
    : 0;

  const loadingAny = loadingDiscover || loadingPortfolio || loadingSignals || loadingTrades;

  return (
    <div className="min-h-screen bg-gray-950 text-white" data-testid="my-dashboard">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-gray-950/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">My Dashboard</h1>
            <span className={clsx(
              'px-3 py-1 rounded-full text-xs font-semibold',
              mode === 'paper' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
            )}>
              {mode === 'paper' ? 'Paper Trading' : 'Live'}
            </span>
          </div>

          {/* Global refresh: clears & refetches all */}
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                await Promise.all([
                  refetchDiscover(),
                  refetchPortfolio(),
                  refetchSignals(),
                  refetchTrades(),
                ]);
              }}
              className="px-3 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/15 border border-white/10"
            >
              {loadingAny ? 'Refreshing…' : 'Refresh All'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 pb-3">
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
            {(['overview','portfolio','signals','activity'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors',
                  tab === t ? 'bg-cyan-500/20 text-cyan-300' : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {tab === 'overview' && (
          <section className="space-y-6" data-testid="overview-tab">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Equity" value={fmtUsd(equityNow)} />
              <KpiCard label="Day Change" value={`${fmtUsd(dayChange)} (${fmtPct(dayChangePct)})`} valueClass={dayChange >= 0 ? 'text-emerald-300' : 'text-red-300'} />
              <KpiCard label="Open Positions" value={String(positions.length)} />
              <KpiCard label="Signals (24h)" value={String(signals.length)} />
            </div>

            {/* Equity + Watchlist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Equity (30D)</h3>
                  <button
                    onClick={() => refetchPortfolio()}
                    className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10 hover:bg-white/15"
                  >
                    {fetchingPortfolio ? 'Refreshing…' : 'Refetch'}
                  </button>
                </div>
                <div className="p-5">
                  {loadingPortfolio ? (
                    <div className="h-48 bg-white/5 rounded" />
                  ) : (
                    <MiniAreaChart data={curve.map(d => d.totalValue)} />
                  )}
                </div>
              </div>

              <div className="glass">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Watchlist</h3>
                  <button
                    onClick={() => refetchDiscover()}
                    className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10 hover:bg-white/15"
                  >
                    {fetchingDiscover ? 'Refreshing…' : 'Refetch'}
                  </button>
                </div>
                <div className="divide-y divide-white/5">
                  {(instruments ?? []).slice(0, 8).map(ins => (
                    <div key={ins.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{ins.symbol}</div>
                        <div className="text-xs text-white/60">{ins.name}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MiniSparkline data={ins.sparkline ?? []} />
                        <div className="text-right">
                          <div className="text-sm">{fmtUsd(ins.price)}</div>
                          <div className={clsx('text-xs', ins.changePercent >= 0 ? 'text-emerald-300' : 'text-red-300')}>
                            {fmtPct(ins.changePercent)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!instruments?.length && <div className="p-4 text-sm text-white/60">No items</div>}
                </div>
              </div>
            </div>

            {/* Signals + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">AI Signals</h3>
                  <button
                    onClick={() => refetchSignals()}
                    className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10 hover:bg-white/15"
                  >
                    {fetchingSignals ? 'Refreshing…' : 'Refetch'}
                  </button>
                </div>
                <SignalsList signals={signals ?? []} loading={loadingSignals} />
              </div>

              <div className="glass">
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <button
                    onClick={() => refetchTrades()}
                    className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10 hover:bg-white/15"
                  >
                    {fetchingTrades ? 'Refreshing…' : 'Refetch'}
                  </button>
                </div>
                <TradesTable trades={trades ?? []} loading={loadingTrades} />
              </div>
            </div>
          </section>
        )}

        {tab === 'portfolio' && (
          <section className="space-y-6" data-testid="portfolio-tab">
            <div className="glass">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Open Positions</h3>
                <button
                  onClick={() => refetchPortfolio()}
                  className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10 hover:bg-white/15"
                >
                  {fetchingPortfolio ? 'Refreshing…' : 'Refetch'}
                </button>
              </div>
              <PositionsTable positions={positions} loading={loadingPortfolio} />
            </div>
          </section>
        )}

        {tab === 'signals' && (
          <section className="space-y-6" data-testid="signals-tab">
            <div className="glass">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI Signals</h3>
                <button
                  onClick={() => refetchSignals()}
                  className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10 hover:bg-white/15"
                >
                  {fetchingSignals ? 'Refreshing…' : 'Refetch'}
                </button>
              </div>
              <SignalsList signals={signals ?? []} loading={loadingSignals} />
            </div>
          </section>
        )}

        {tab === 'activity' && (
          <section className="space-y-6" data-testid="activity-tab">
            <div className="glass">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Trades</h3>
                <button
                  onClick={() => refetchTrades()}
                  className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10 hover:bg-white/15"
                >
                  {fetchingTrades ? 'Refreshing…' : 'Refetch'}
                </button>
              </div>
              <TradesTable trades={trades ?? []} loading={loadingTrades} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ───────────────────────────────────────────────────────── UI bits
function KpiCard({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="glass p-5">
      <div className="text-sm text-white/60">{label}</div>
      <div className={clsx('text-2xl font-semibold mt-1', valueClass)}>{value}</div>
    </div>
  );
}

function MiniSparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return <div className="w-[60px] h-4 bg-white/10 rounded" />;
  const max = Math.max(...data), min = Math.min(...data);
  const range = Math.max(1e-6, max - min);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 60;
    const y = 16 - ((v - min) / range) * 16;
    return `${x},${y}`;
  }).join(' ');
  const up = data[data.length - 1] >= data[0];
  return (
    <svg width="60" height="16" viewBox="0 0 60 16" className="opacity-90">
      <polyline fill="none" stroke={up ? '#34D399' : '#F87171'} strokeWidth="2" points={pts} />
    </svg>
  );
}

function MiniAreaChart({ data }: { data: number[] }) {
  if (!data?.length) {
    return <div data-testid="chart-container" className="h-48 bg-white/5 rounded-lg" />;
  }
  const max = Math.max(...data), min = Math.min(...data);
  const range = Math.max(1e-6, max - min);
  const width = 640, height = 180;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  const area = `0,${height} ${pts} ${width},${height}`;
  return (
    <svg data-testid="chart-container" className="w-full h-48" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="#22D3EE" strokeWidth="2" />
      <polygon points={area} fill="rgba(34,211,238,0.15)" />
    </svg>
  );
}

function SignalsList({ signals, loading }: { signals: Signal[]; loading: boolean }) {
  if (loading) return <div className="p-5 text-sm text-white/60">Loading signals…</div>;
  if (!signals.length) return <div className="p-5 text-sm text-white/60">No signals</div>;

  return (
    <div className="divide-y divide-white/5">
      {signals.map(s => (
        <div key={s.id} className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className={clsx(
              'px-3 py-1 rounded-full text-xs font-semibold',
              s.signalType === 'BUY' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'
            )}>
              {s.signalType}
            </span>
            <div>
              <div className="font-semibold">{s.symbol}</div>
              <div className="text-xs text-white/60">{s.name ?? '—'}</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Stat label="Strength" value={`${s.strength}%`} />
            <Stat label="Confidence" value={`${s.confidence}%`} />
            <Stat label="Risk" value={s.riskLevel} valueClass={
              s.riskLevel === 'LOW' ? 'text-emerald-300' : s.riskLevel === 'MEDIUM' ? 'text-amber-300' : 'text-red-300'
            } />
          </div>
          <div className="text-right">
            <div className="text-sm">{s.currentPrice ? fmtUsd(s.currentPrice) : '—'}</div>
            {typeof s.priceChange === 'number' && (
              <div className={clsx('text-xs', s.priceChange >= 0 ? 'text-emerald-300' : 'text-red-300')}>
                {fmtPct(s.priceChange)}
              </div>
            )}
          </div>
          {s.reasoning?.length ? (
            <div className="w-full">
              <div className="mt-3 flex flex-wrap gap-2">
                {s.reasoning.map((r, i) => (
                  <span key={i} className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded">{r}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function TradesTable({ trades, loading }: { trades: Trade[]; loading: boolean }) {
  if (loading) return <div className="p-5 text-sm text-white/60">Loading trades…</div>;
  if (!trades.length) return <div className="p-5 text-sm text-white/60">No recent trades</div>;

  return (
    <div className="p-5 overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="text-left text-sm text-white/70 border-b border-white/10">
            <th className="py-2 pr-4">Time</th>
            <th className="py-2 pr-4">Symbol</th>
            <th className="py-2 pr-4">Side</th>
            <th className="py-2 pr-4 text-right">Qty</th>
            <th className="py-2 pr-0 text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {trades.map(t => (
            <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-3 pr-4 text-sm">
                {new Date(t.ts).toLocaleDateString()} {new Date(t.ts).toLocaleTimeString()}
              </td>
              <td className="py-3 pr-4 font-semibold">{t.symbol}</td>
              <td className="py-3 pr-4">
                <span className={clsx(
                  'px-2 py-1 rounded text-xs font-semibold',
                  t.side === 'buy' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'
                )}>
                  {t.side.toUpperCase()}
                </span>
              </td>
              <td className="py-3 pr-4 text-right">{t.qty}</td>
              <td className="py-3 pr-0 text-right">{fmtUsd(t.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PositionsTable({ positions, loading }: { positions: Position[]; loading: boolean }) {
  if (loading) return <div className="p-5 text-sm text-white/60">Loading positions…</div>;
  if (!positions.length) return <div className="p-5 text-sm text-white/60">No open positions</div>;

  return (
    <div className="p-5 overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="text-left text-sm text-white/70 border-b border-white/10">
            <th className="py-2 pr-4">Symbol</th>
            <th className="py-2 pr-4">Side</th>
            <th className="py-2 pr-4 text-right">Qty</th>
            <th className="py-2 pr-4 text-right">Avg Price</th>
            <th className="py-2 pr-4 text-right">Market Value</th>
            <th className="py-2 pr-0 text-right">Unrealized P/L</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(p => (
            <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-3 pr-4 font-semibold">{p.symbol}</td>
              <td className="py-3 pr-4">
                <span className={clsx(
                  'px-2 py-1 rounded text-xs font-semibold',
                  p.side === 'long' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'
                )}>
                  {p.side.toUpperCase()}
                </span>
              </td>
              <td className="py-3 pr-4 text-right">{p.qty}</td>
              <td className="py-3 pr-4 text-right">{fmtUsd(p.avgPrice)}</td>
              <td className="py-3 pr-4 text-right">{fmtUsd(p.marketValue)}</td>
              <td className={clsx('py-3 pr-0 text-right font-semibold', p.unrealizedPL >= 0 ? 'text-emerald-300' : 'text-red-300')}>
                {fmtUsd(p.unrealizedPL)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-white/60">{label}</div>
      <div className={clsx('text-sm font-semibold', valueClass)}>{value}</div>
    </div>
  );
}

// Tailwind helper: add in your CSS if not already present
// .glass { @apply bg-white/5 border border-white/10 rounded-xl; }