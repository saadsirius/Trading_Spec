'use client';

import { useQuery } from '@tanstack/react-query';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

/**
 * File: app/(trading)/screener/page.tsx (or components/Screener.tsx)
 * Purpose: Factor Screener (UX-safe, SSR-safe). Debounced filters, stable sort, a11y, empty/skeleton states,
 *          CSV export, and memoized derivations. Strictly client-only.
 */

type Num = number; // tiny alias for readability

interface FactorData {
  symbol: string;
  momentum: Num; // 0–100
  value: Num;    // 0–100 (higher = cheaper)
  quality: Num;  // 0–100
  risk: Num;     // 0–100 (lower better)
  growth: Num;   // 0–100
  asOf: string;  // ISO
}

type SortKey = keyof FactorData;
type Order = 'asc' | 'desc';

export default function Screener() {
  // ── State ───────────────────────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState<SortKey>('momentum');
  const [sortOrder, setSortOrder] = useState<Order>('desc');

  const [filter, setFilter] = useState({
    symbol: '',
    minMomentum: '',
    minValue: '',
    minQuality: '',
    maxRisk: '',
    minGrowth: '',
  });

  // Debounce filters so we don't spam /api
  const [debouncedFilter, setDebouncedFilter] = useState(filter);
  const debounceTimer = useRef<number | null>(null);
  useEffect(() => {
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => setDebouncedFilter(filter), 250);
    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [filter]);

  // Defer sort key/order to avoid blocking keystrokes on low devices
  const deferredSortBy = useDeferredValue(sortBy);
  const deferredOrder = useDeferredValue(sortOrder);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['factors', debouncedFilter],
    queryFn: async (): Promise<FactorData[]> => {
      const params = new URLSearchParams();
      if (debouncedFilter.symbol) params.append('symbol', debouncedFilter.symbol);
      if (debouncedFilter.minMomentum) params.append('minMomentum', debouncedFilter.minMomentum);
      if (debouncedFilter.minValue) params.append('minValue', debouncedFilter.minValue);
      if (debouncedFilter.minQuality) params.append('minQuality', debouncedFilter.minQuality);
      if (debouncedFilter.maxRisk) params.append('maxRisk', debouncedFilter.maxRisk);
      if (debouncedFilter.minGrowth) params.append('minGrowth', debouncedFilter.minGrowth);

      const res = await fetch(`/api/factors?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch factors');
      return res.json();
    },
  });

  // ── Derived: sorted + stable (index tiebreaker) ─────────────────────────────
  const sorted = useMemo(() => {
    if (!data?.length) return [] as FactorData[];
    const arr = data.map((d, i) => ({ d, i })); // carry original index for stable sort

    const key = deferredSortBy;
    const dir = deferredOrder === 'asc' ? 1 : -1;

    arr.sort((A, B) => {
      const a = A.d[key];
      const b = B.d[key];
      // string vs number safe compare
      if (typeof a === 'number' && typeof b === 'number') {
        if (a === b) return A.i - B.i; // stable
        return (a - b) * dir;
      }
      // fallback to string compare (e.g., symbol)
      const as = String(a ?? '');
      const bs = String(b ?? '');
      if (as === bs) return A.i - B.i;
      return (as > bs ? 1 : -1) * dir;
    });

    return arr.map(x => x.d);
  }, [data, deferredSortBy, deferredOrder]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const onSort = (col: SortKey) => {
    if (sortBy === col) setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setSortOrder(col === 'symbol' ? 'asc' : 'desc');
    }
  };

  const scoreColor = (score: number) =>
    score >= 80 ? 'text-green-400' :
    score >= 60 ? 'text-yellow-400' :
    score >= 40 ? 'text-orange-400' :
    'text-red-400';

  const scoreBg = (score: number) =>
    score >= 80 ? 'bg-green-900' :
    score >= 60 ? 'bg-yellow-900' :
    score >= 40 ? 'bg-orange-900' :
    'bg-red-900';

  const lastUpdated = useMemo(() => {
    if (!data?.length) return '';
    const maxIso = data.reduce((max, x) => (x.asOf > max ? x.asOf : max), data[0].asOf);
    try {
      return new Date(maxIso).toLocaleString();
    } catch {
      return maxIso;
    }
  }, [data]);

  const exportCsv = () => {
    if (!sorted.length) return;
    const headers: (keyof FactorData)[] = ['symbol', 'momentum', 'value', 'quality', 'risk', 'growth', 'asOf'];
    const rows = sorted.map(r => headers.map(h => r[h]));
    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(v => (typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : String(v))).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `factors_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Factor Screener</h1>
          {isFetching && <span className="text-xs px-2 py-1 rounded bg-white/10">Updating…</span>}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>{sorted.length} symbols</span>
          {lastUpdated && <span>• Last update: {lastUpdated}</span>}
          <button
            onClick={exportCsv}
            className="ml-2 px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Export CSV"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <section className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Field label="Symbol">
            <input
              type="text"
              inputMode="text"
              placeholder="e.g., AAPL"
              value={filter.symbol}
              onChange={(e) => setFilter(p => ({ ...p, symbol: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Field>

          <NumericField
            label="Min Momentum"
            value={filter.minMomentum}
            onChange={(v) => setFilter(p => ({ ...p, minMomentum: v }))}
          />

          <NumericField
            label="Min Value"
            value={filter.minValue}
            onChange={(v) => setFilter(p => ({ ...p, minValue: v }))}
          />

          <NumericField
            label="Min Quality"
            value={filter.minQuality}
            onChange={(v) => setFilter(p => ({ ...p, minQuality: v }))}
          />

          <NumericField
            label="Max Risk"
            value={filter.maxRisk}
            onChange={(v) => setFilter(p => ({ ...p, maxRisk: v }))}
          />

          <NumericField
            label="Min Growth"
            value={filter.minGrowth}
            onChange={(v) => setFilter(p => ({ ...p, minGrowth: v }))}
          />
        </div>
      </section>

      {/* Table */}
      <section className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Factor Analysis</h2>
        </div>

        {/* Loading / Error / Empty */}
        {isLoading ? (
          <SkeletonTable />
        ) : error ? (
          <div className="p-6 text-red-300">Failed to load factors.</div>
        ) : sorted.length === 0 ? (
          <div className="p-6 text-gray-400">No factors found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-gray-800 z-10">
                <tr className="border-b border-gray-700">
                  <SortableTh label="Symbol" active={sortBy === 'symbol'} order={sortOrder} onClick={() => onSort('symbol')} />
                  <SortableTh label="Momentum" active={sortBy === 'momentum'} order={sortOrder} onClick={() => onSort('momentum')} />
                  <SortableTh label="Value" active={sortBy === 'value'} order={sortOrder} onClick={() => onSort('value')} />
                  <SortableTh label="Quality" active={sortBy === 'quality'} order={sortOrder} onClick={() => onSort('quality')} />
                  <SortableTh label="Risk" active={sortBy === 'risk'} order={sortOrder} onClick={() => onSort('risk')} />
                  <SortableTh label="Growth" active={sortBy === 'growth'} order={sortOrder} onClick={() => onSort('growth')} />
                  <th className="text-left py-3 px-4 text-gray-300">Updated</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((f) => (
                  <tr key={f.symbol} className="border-b border-gray-700 hover:bg-gray-700/70">
                    <td className="py-3 px-4 font-semibold tracking-wide">{f.symbol}</td>

                    <ScoreCell value={f.momentum} />
                    <ScoreCell value={f.value} />
                    <ScoreCell value={f.quality} />
                    <ScoreCell value={f.risk} invert /> {/* risk lower is better, but we still color by absolute value */}
                    <ScoreCell value={f.growth} />

                    <td className="py-3 px-4 text-sm text-gray-400">
                      {safeDate(f.asOf)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );

  // ── Subcomponents ───────────────────────────────────────────────────────────

  function ScoreCell({ value, invert = false }: { value: number; invert?: boolean }) {
    const color = scoreColor(value);
    const bg = scoreBg(value);
    // For risk, you might want different mapping; here we show the score as-is.
    return (
      <td className="py-3 px-4">
        <div className={clsx("px-2 py-1 rounded text-sm font-semibold inline-block", bg, color)}>
          {value.toFixed(1)}
        </div>
      </td>
    );
  }

  function safeDate(v: string) {
    try {
      return new Date(v).toLocaleDateString();
    } catch {
      return v;
    }
  }
}

// ── Small UI bits ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
}

function NumericField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        inputMode="numeric"
        placeholder="0-100"
        min={0}
        max={100}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '') return onChange('');
          const n = Number(v);
          if (Number.isNaN(n)) return;
          onChange(String(Math.max(0, Math.min(100, n))));
        }}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </Field>
  );
}

function SortableTh({
  label,
  active,
  order,
  onClick,
}: {
  label: string;
  active: boolean;
  order: Order;
  onClick: () => void;
}) {
  return (
    <th scope="col" className="text-left py-3 px-4">
      <button
        onClick={onClick}
        aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={clsx(
          'inline-flex items-center gap-1 rounded px-2 py-1',
          active ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10'
        )}
      >
        <span>{label}</span>
        {active && <span className="text-xs">{order === 'asc' ? '▲' : '▼'}</span>}
      </button>
    </th>
  );
}

function SkeletonTable() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-700/70 rounded" />
        ))}
      </div>
    </div>
  );
}