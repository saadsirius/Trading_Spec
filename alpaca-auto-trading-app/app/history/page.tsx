'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  price: number;
  ts: string;              // ISO date
  orderId?: string;
}

type SideFilter = '' | 'buy' | 'sell';

// ─────────────────────────────────────────────────────────────────────────────
/** small debounce hook (no re-renders storm) */
function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// Formatters (stable)
const fmtUsd = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

const fmtNum = (n: number) => n.toLocaleString();

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function History() {
  // Filters + UI state
  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState<SideFilter>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<10 | 25 | 50>(25);

  // Debounced values to avoid hammering API while typing
  const dSymbol = useDebounced(symbol);
  const dSide = useDebounced(side);
  const dFrom = useDebounced(dateFrom);
  const dTo = useDebounced(dateTo);
  const dPage = useDebounced(page);
  const dPageSize = useDebounced(pageSize);

  // Build query string
  const searchParams = useMemo(() => {
    const p = new URLSearchParams();
    if (dSymbol) p.set('symbol', dSymbol.trim());
    if (dSide) p.set('side', dSide);
    if (dFrom) p.set('dateFrom', dFrom);
    if (dTo) p.set('dateTo', dTo);
    // server-side pagination if your API supports it; if not, you can remove these
    p.set('page', String(dPage));
    p.set('pageSize', String(dPageSize));
    return p.toString();
  }, [dSymbol, dSide, dFrom, dTo, dPage, dPageSize]);

  // Data fetch with AbortController (SSR-safe)
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['trades', searchParams],
    queryFn: async ({ signal }): Promise<{ trades: Trade[]; total?: number }> => {
      const res = await fetch(`/api/trades?${searchParams}`, { signal });
      if (!res.ok) throw new Error(`Failed to fetch trades (${res.status})`);
      // Support both array and {trades,total} payloads
      const json = await res.json();
      if (Array.isArray(json)) return { trades: json, total: json.length };
      return json;
    },
    staleTime: 10_000,
    keepPreviousData: true,
  });

  // If backend doesn't support pagination, do client-side slice
  const allTrades = data?.trades ?? [];
  const total = typeof data?.total === 'number' ? data!.total : allTrades.length;
  const pagedTrades =
    typeof data?.total === 'number'
      ? allTrades
      : allTrades.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  // Derived stats (O(n))
  const { volume, buys, sells } = useMemo(() => {
    let vol = 0;
    let b = 0;
    let s = 0;
    for (const t of allTrades) {
      vol += t.qty * t.price;
      if (t.side === 'buy') b++;
      else if (t.side === 'sell') s++;
    }
    return { volume: vol, buys: b, sells: s };
  }, [allTrades]);

  // Reset page when filters change (without debounce jitter)
  useEffect(() => {
    setPage(1);
  }, [symbol, side, dateFrom, dateTo, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function exportCSV() {
    const header = ['Date', 'Symbol', 'Side', 'Quantity', 'Price', 'Value', 'Order ID'];
    const rows = allTrades.map((t) => [
      new Date(t.ts).toISOString(),
      t.symbol,
      t.side.toUpperCase(),
      String(t.qty),
      t.price.toFixed(4),
      (t.qty * t.price).toFixed(2),
      t.orderId ?? '',
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trades.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen" data-testid="history-root">
      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Trade History</h1>
          <p className="text-sm text-gray-400 mt-1">
            {total.toLocaleString()} trades • {fmtUsd(volume)} volume
            {isFetching ? <span className="ml-2 text-xs text-blue-300">syncing…</span> : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Trade stats">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Total Volume</div>
          <div className="text-2xl font-bold">{fmtUsd(volume)}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Buy Orders</div>
          <div className="text-2xl font-bold text-green-400">{fmtNum(buys)}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Sell Orders</div>
          <div className="text-2xl font-bold text-red-400">{fmtNum(sells)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg" role="region" aria-label="Filters">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={() => {
              setSymbol('');
              setSide('');
              setDateFrom('');
              setDateTo('');
            }}
            className="text-sm text-gray-300 hover:text-white"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Symbol</label>
            <input
              type="text"
              inputMode="latin"
              placeholder="e.g., AAPL"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Side</label>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value as SideFilter)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Page Size</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value) as 10 | 25 | 50)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg" data-testid="trades-table">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Trades</h2>
          <div className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </div>
        </div>

        {error ? (
          <div className="p-6 text-red-300" role="alert">
            {(error as Error).message}
          </div>
        ) : isLoading ? (
          <SkeletonTable rows={Math.min(pageSize, 10)} />
        ) : pagedTrades.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <Th>Date</Th>
                    <Th>Symbol</Th>
                    <Th>Side</Th>
                    <Th className="text-right">Qty</Th>
                    <Th className="text-right">Price</Th>
                    <Th className="text-right">Value</Th>
                    <Th>Order ID</Th>
                  </tr>
                </thead>
                <tbody>
                  {pagedTrades.map((t) => {
                    const value = t.qty * t.price;
                    const d = new Date(t.ts);
                    return (
                      <tr key={t.id} className="border-b border-gray-700 hover:bg-gray-700/60">
                        <Td>
                          <div className="text-sm">{d.toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">{d.toLocaleTimeString()}</div>
                        </Td>
                        <Td className="font-semibold">{t.symbol}</Td>
                        <Td>
                          <span
                            className={clsx(
                              'px-2 py-1 rounded text-xs font-semibold',
                              t.side === 'buy'
                                ? 'bg-green-900 text-green-300'
                                : 'bg-red-900 text-red-300'
                            )}
                          >
                            {t.side.toUpperCase()}
                          </span>
                        </Td>
                        <Td className="text-right">{fmtNum(t.qty)}</Td>
                        <Td className="text-right">{fmtUsd(t.price)}</Td>
                        <Td className="text-right font-semibold">{fmtUsd(value)}</Td>
                        <Td className="text-sm text-gray-400">{t.orderId ?? '-'}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-gray-700">
              <button
                className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <div className="text-sm text-gray-300">
                Showing{' '}
                <span className="font-semibold">
                  {total === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
                </span>{' '}
                of <span className="font-semibold">{fmtNum(total)}</span>
              </div>
              <button
                className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-gray-400">No trades found</div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small presentational helpers
// ─────────────────────────────────────────────────────────────────────────────
function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={clsx('text-left py-3 px-4 text-sm font-semibold text-gray-300', className)}>
      {children}
    </th>
  );
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={clsx('py-3 px-4 align-middle', className)}>{children}</td>;
}

function SkeletonTable({ rows = 8 }: { rows?: number }) {
  return (
    <div className="p-4">
      <div className="animate-pulse space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-700/70 rounded" />
        ))}
      </div>
    </div>
  );
}