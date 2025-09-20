'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '@/components/search/SearchBar';
import TickerCard from '@/components/search/TickerCard';
import SearchHistory from '@/components/search/SearchHistory';
import SearchFilters from '@/components/search/SearchFilters';
import SearchResultsSummary from '@/components/search/SearchResultsSummary';

/**
 * File: app/(search)/search/page.tsx (or wherever you mount it)
 * Purpose: Robust Search page with:
 * - URL-sync (query + filters)
 * - Debounced fallback fetch (works even if SearchBar isn't wired to fetch)
 * - Cancelled requests via AbortController
 * - Local compare tray, watchlist/alerts actions
 * - Fast filtering, empty/error/skeleton states
 * Notes:
 * - Keeps your existing child components (SearchBar, TickerCard, etc.)
 * - Strictly client, SSR-safe
 */

type SearchItem = {
  symbol: string;
  name?: string;
  type?: string;
  price?: number;
  volumeAvg?: number;
  change1d?: number; // 0.0123 = +1.23%
  esg?: { grade?: string };
  [k: string]: any;
};

type Filters = {
  type?: string[];
  minPrice?: number;
  maxPrice?: number;
  minVolume?: number;
  minChange?: number; // in %
  maxChange?: number; // in %
  esgGrade?: string[];
};

export default function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();

  // ── State ───────────────────────────────────────────────────────────────────
  const [items, setItems] = useState<SearchItem[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters | null>(() => {
    const f = params.get('f');
    try { return f ? (JSON.parse(decodeURIComponent(f)) as Filters) : null; }
    catch { return null; }
  });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if SearchBar delivered results (so we don't double-fetch)
  const externalResultsRef = useRef(false);

  // ── Child -> Parent bridges ─────────────────────────────────────────────────
  const handleResults = (results: SearchItem[]) => {
    externalResultsRef.current = true;
    setItems(results ?? []);
    setLoading(false);
    setError(null);
  };

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setLoading(Boolean(newQuery));
    setError(null);
    externalResultsRef.current = false; // new search cycle
  };

  const handleHistorySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
    setLoading(Boolean(selectedQuery));
    setError(null);
    externalResultsRef.current = false;
  };

  // ── URL sync (q + filters) ──────────────────────────────────────────────────
  useEffect(() => {
    const next = new URLSearchParams(params.toString());
    if (query) next.set('q', query); else next.delete('q');
    if (filters && Object.keys(filters).length) {
      next.set('f', encodeURIComponent(JSON.stringify(filters)));
    } else {
      next.delete('f');
    }
    // Push shallow (no scroll)
    router.replace(`?${next.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters]);

  // ── Debounced fallback fetch (if SearchBar didn't fetch) ────────────────────
  useEffect(() => {
    if (!query) { setItems([]); setLoading(false); setError(null); return; }
    let ac = new AbortController();
    const t = setTimeout(async () => {
      if (externalResultsRef.current) return; // child already fetched
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ac.signal, cache: 'no-store' });
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const data = (await res.json()) as SearchItem[];
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setLoading(false);
        setError(e?.message || 'Search error');
      }
    }, 300);

    return () => { clearTimeout(t); ac.abort(); };
  }, [query]);

  // ── Filtering (fast, memoized) ──────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    if (!filters) return items;
    return items.filter((item) => {
      if (filters.type?.length && item.type && !filters.type.includes(item.type)) return false;

      if (typeof filters.minPrice === 'number' && item.price != null && item.price < filters.minPrice) return false;
      if (typeof filters.maxPrice === 'number' && item.price != null && item.price > filters.maxPrice) return false;

      if (typeof filters.minVolume === 'number' && item.volumeAvg != null && item.volumeAvg < filters.minVolume) return false;

      // change1d stored as fraction (0.0123 => 1.23%)
      const pct = typeof item.change1d === 'number' ? item.change1d * 100 : undefined;
      if (typeof filters.minChange === 'number' && pct != null && pct < filters.minChange) return false;
      if (typeof filters.maxChange === 'number' && pct != null && pct > filters.maxChange) return false;

      if (filters.esgGrade?.length && item.esg?.grade && !filters.esgGrade.includes(item.esg.grade)) return false;

      return true;
    });
  }, [items, filters]);

  // ── Compare tray handlers ───────────────────────────────────────────────────
  const addCompare = (s: string) =>
    setCompare((prev) => Array.from(new Set([...prev, s])).slice(0, 6));
  const clearCompare = () => setCompare([]);
  const openCompare = () =>
    router.push(`/compare?symbols=${compare.join(',')}`);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-5 space-y-4" data-testid="search-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recherche</h1>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="badge"
          aria-expanded={showFilters}
          aria-controls="filters-panel"
        >
          {showFilters ? 'Masquer filtres' : 'Filtres'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          {/* Search bar drives query/results (child may fetch itself) */}
          <SearchBar onResults={handleResults} onQueryChange={handleQueryChange} initialQuery={query} />

          {/* Summary / states */}
          <SearchResultsSummary
            query={query}
            results={filteredItems}
            loading={loading}
            error={error ?? undefined}
            filters={filters}
          />

          {/* Compare tray */}
          {compare.length > 0 && (
            <div className="ds-card p-2 flex items-center gap-2" role="region" aria-label="Comparateur">
              <div className="text-xs text-gray-400">Comparateur:</div>
              {compare.map((s) => (
                <span key={s} className="badge" aria-label={`Comparer ${s}`}>{s}</span>
              ))}
              <button className="badge" onClick={openCompare}>Ouvrir</button>
              <button className="badge" onClick={clearCompare}>Reset</button>
            </div>
          )}

          {/* Results grid */}
          <div className="grid-auto" data-testid="results-grid">
            {!loading && !error && filteredItems.map((it) => (
              <TickerCard
                key={it.symbol}
                item={it}
                onAddWatch={(s) => {
                  fetch('/api/watchlist/add', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ symbol: s }),
                  }).catch(() => {});
                }}
                onCompare={addCompare}
                onAlert={(s) => {
                  fetch('/api/alerts/create', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ symbol: s, rule: 'price_cross_donchian_20' }),
                  }).catch(() => {});
                }}
              />
            ))}

            {/* Skeletons */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-hidden>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="ds-card p-4 animate-pulse">
                    <div className="h-5 w-24 bg-white/20 rounded mb-3" />
                    <div className="h-4 w-2/3 bg-white/10 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-white/10 rounded mb-4" />
                    <div className="h-8 w-full bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty / Error */}
            {!loading && !error && query && filteredItems.length === 0 && (
              <div className="ds-card p-6 text-center text-gray-400">
                Aucun résultat pour "{query}".
              </div>
            )}
            {error && (
              <div className="ds-card p-6 text-center text-red-400" role="alert">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Side rail */}
        <div className="space-y-4">
          <SearchHistory onSelect={handleHistorySelect} />
          <SearchFilters
            id="filters-panel"
            onFiltersChange={setFilters}
            isOpen={showFilters}
            onToggle={() => setShowFilters((v) => !v)}
            initialFilters={filters ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}