'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

/** ─────────────────────────── Types */
interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  spark?: number[];
}

/** ─────────────────────────── Utils */
const fmtUSD = (n: number) =>
  n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
const abbreviate = (n: number) =>
  n >= 1e12 ? `${(n / 1e12).toFixed(1)}T` :
  n >= 1e9  ? `${(n / 1e9 ).toFixed(1)}B` :
  n >= 1e6  ? `${(n / 1e6 ).toFixed(1)}M` :
  n >= 1e3  ? `${(n / 1e3 ).toFixed(1)}K` : `${n}`;

function useDebounced<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/** ─────────────────────────── Mock datasource (local dev safe) */
const MOCK: Stock[] = [
  { symbol: 'AAPL',  name: 'Apple Inc.',              price: 175.5, change: 2.3,  changePercent: 1.33, volume: 45_000_000, marketCap: 2_750_000_000_000, sector: 'Technology', spark:[168,170,171,174,175] },
  { symbol: 'TSLA',  name: 'Tesla, Inc.',            price: 245.8, change:-5.2,  changePercent:-2.07, volume: 32_000_000, marketCap:   780_000_000_000, sector: 'Automotive', spark:[260,252,249,247,245] },
  { symbol: 'NVDA',  name: 'NVIDIA Corporation',     price: 485.3, change:12.5,  changePercent: 2.64, volume: 28_000_000, marketCap: 1_200_000_000_000, sector: 'Technology', spark:[455,465,472,480,485] },
  { symbol: 'MSFT',  name: 'Microsoft Corporation',  price: 378.9, change: 1.8,  changePercent: 0.48, volume: 25_000_000, marketCap: 2_800_000_000_000, sector: 'Technology', spark:[372,374,376,377,378] },
  { symbol: 'GOOGL', name: 'Alphabet Inc.',          price: 142.2, change:-0.8,  changePercent:-0.56, volume: 18_000_000, marketCap: 1_800_000_000_000, sector: 'Technology', spark:[144,143,143,142.6,142.2] },
  { symbol: 'AMZN',  name: 'Amazon.com, Inc.',       price: 155.4, change: 3.2,  changePercent: 2.10, volume: 22_000_000, marketCap: 1_600_000_000_000, sector: 'Consumer Discretionary', spark:[149,151,153,154,155] },
  { symbol: 'UNH',   name: 'UnitedHealth Group',     price: 506.9, change:-1.4,  changePercent:-0.28, volume:  4_800_000, marketCap:   460_000_000_000, sector: 'Healthcare', spark:[512,511,509,508,506] },
  { symbol: 'JPM',   name: 'JPMorgan Chase',         price: 188.4, change: 0.9,  changePercent: 0.49, volume:  9_100_000, marketCap:   545_000_000_000, sector: 'Financial', spark:[186,186.5,187,188,188.4] },
];

/** ─────────────────────────── Data hook (search, sector) */
function useDiscoverStocks(term: string, sector: string) {
  const debounced = useDebounced(term, 300);
  return useQuery({
    queryKey: ['discover-stocks', debounced, sector],
    queryFn: async (): Promise<Stock[]> => {
      // In real app call your API here with query params;
      // we filter locally for mock/demo.
      const q = debounced.trim().toLowerCase();
      let out = MOCK;
      if (q) {
        out = out.filter(
          s =>
            s.symbol.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q)
        );
      }
      if (sector) out = out.filter(s => s.sector === sector);
      // simulate latency
      await new Promise(r => setTimeout(r, 220));
      return out;
    },
    staleTime: 60_000,
  });
}

/** ─────────────────────────── Page */
export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [sort, setSort] = useState<'change'|'price'|'volume'|'marketCap'>('change');
  const [order, setOrder] = useState<'desc'|'asc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const { data, isLoading, isFetching, isError, error } = useDiscoverStocks(searchTerm, selectedSector);

  const sectors = useMemo(() => {
    const set = new Set<string>();
    MOCK.forEach(s => set.add(s.sector));
    return Array.from(set).sort();
  }, []);

  const sorted = useMemo(() => {
    const arr = [...(data ?? [])];
    arr.sort((a, b) => {
      const map = {
        price: a.price - b.price,
        change: a.changePercent - b.changePercent,
        volume: a.volume - b.volume,
        marketCap: a.marketCap - b.marketCap,
      } as const;
      const diff =
        sort === 'price' ? map.price :
        sort === 'change' ? map.change :
        sort === 'volume' ? map.volume : map.marketCap;
      return order === 'asc' ? diff : -diff;
    });
    return arr;
  }, [data, sort, order]);

  const totalPages = Math.max(1, Math.ceil((sorted?.length ?? 0) / pageSize));
  const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    // reset pagination when filters change
    setPage(1);
  }, [searchTerm, selectedSector]);

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen" data-testid="discover-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Discover Stocks</h1>
        <div className="text-sm text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded">
          🟢 Paper Trading Mode
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
              Search Stocks
            </label>
            <input
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by symbol or name..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Sector */}
          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Sector
            </label>
            <select
              id="sector"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">All Sectors</option>
              {sectors.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sorting */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="text-sm text-gray-400">Sort by:</div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="change">Change %</option>
            <option value="price">Price</option>
            <option value="volume">Volume</option>
            <option value="marketCap">Market Cap</option>
          </select>
          <button
            onClick={() => setOrder(o => (o === 'asc' ? 'desc' : 'asc'))}
            className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 text-sm"
            aria-label="Toggle sort order"
          >
            {order === 'asc' ? '⬆️ Asc' : '⬇️ Desc'}
          </button>

          <div className="ml-auto text-sm text-gray-400">
            {isFetching ? 'Refreshing…' : `${data?.length ?? 0} results`}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Available Stocks</h2>

        {isLoading ? (
          <SkeletonGrid />
        ) : isError ? (
          <div className="text-red-300">Failed to load stocks {(error as Error)?.message ? `— ${(error as Error).message}` : ''}</div>
        ) : pageData.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="stocks-grid">
              {pageData.map(stock => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                className="px-3 py-2 rounded bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <div className="text-sm text-gray-300">{page} / {totalPages}</div>
              <button
                className="px-3 py-2 rounded bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-400 text-center py-8" data-testid="empty-state">
            No stocks found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

/** ─────────────────────────── Bits */
function StockCard({ stock }: { stock: Stock }) {
  const [watch, setWatch] = useState(false);
  const up = stock.changePercent >= 0;

  return (
    <div
      className="bg-gray-700 p-4 rounded-lg hover:bg-gray-650/60 transition-colors border border-transparent hover:border-white/10"
      data-testid={`stock-${stock.symbol}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-lg truncate">{stock.symbol}</h3>
          <p className="text-sm text-gray-400 truncate">{stock.name}</p>
        </div>
        <span className="text-xs bg-gray-600 px-2 py-1 rounded whitespace-nowrap">{stock.sector}</span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <Row label="Price" value={fmtUSD(stock.price)} />
        <Row
          label="Change"
          value={`${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} (${fmtPct(stock.changePercent)})`}
          className={up ? 'text-green-400' : 'text-red-400'}
        />
        <Row label="Volume" value={abbreviate(stock.volume)} />
        <Row label="Market Cap" value={`$${abbreviate(stock.marketCap)}`} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <MiniSparkline data={stock.spark ?? []} />
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            onClick={() => console.log('View details', stock.symbol)}
          >
            View
          </button>
          <button
            className={clsx(
              'px-3 py-2 rounded text-sm font-medium',
              watch ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'
            )}
            onClick={() => setWatch(v => !v)}
            aria-pressed={watch}
          >
            {watch ? '✓ Watchlisted' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}:</span>
      <span className={clsx('font-semibold', className)}>{value}</span>
    </div>
  );
}

function MiniSparkline({ data }: { data: number[] }) {
  if (!data.length) return <div className="w-[72px] h-6 bg-white/10 rounded" aria-hidden />;
  const w = 72, h = 24;
  const min = Math.min(...data), max = Math.max(...data), range = Math.max(1e-6, max - min);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  const up = data[data.length - 1] >= data[0];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-label="sparkline">
      <polyline fill="none" stroke={up ? '#34D399' : '#F87171'} strokeWidth="2" points={pts} />
    </svg>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="skeleton-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-gray-700 p-4 rounded-lg animate-pulse space-y-3">
          <div className="flex justify-between">
            <div className="h-5 w-24 bg-gray-600 rounded" />
            <div className="h-5 w-20 bg-gray-600 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-4 bg-gray-600 rounded" />
            <div className="h-4 bg-gray-600 rounded" />
            <div className="h-4 bg-gray-600 rounded" />
            <div className="h-4 bg-gray-600 rounded" />
          </div>
          <div className="h-6 bg-gray-600 rounded" />
        </div>
      ))}
    </div>
  );
}