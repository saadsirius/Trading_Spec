'use client';
import { useEffect, useRef } from 'react';
import { useSymbolSearch } from '@/hooks/useSymbolSearch';

export default function SearchSymbol() {
  const { q, setQ, results, loading, selectedIdx, setSelectedIdx, favorites, toggleFavorite, go } = useSymbolSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && document.activeElement !== inputRef.current) {
        e.preventDefault(); inputRef.current?.focus();
      }
      if (['ArrowDown','ArrowUp','Enter','Escape'].includes(e.key)) {
        if (!document.activeElement || document.activeElement === inputRef.current) {
          if (e.key === 'ArrowDown') setSelectedIdx(i => Math.min(i+1, results.length-1));
          if (e.key === 'ArrowUp') setSelectedIdx(i => Math.max(i-1, 0));
          if (e.key === 'Enter' && results[selectedIdx]) go(results[selectedIdx].symbol);
          if (e.key === 'Escape') inputRef.current?.blur();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [results, selectedIdx, go]);

  return (
    <div className="relative w-full max-w-xl">
      <input
        ref={inputRef}
        value={q}
        onChange={e=>setQ(e.target.value)}
        placeholder="Rechercher un symbole (AAPL, MSFT…) — / pour focus"
        className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none"
      />
      {q && (
        <div className="absolute z-20 mt-1 max-h-96 w-full overflow-auto rounded-md border bg-white text-sm">
          {loading && <div className="p-2 text-gray-500">Chargement…</div>}
          {!loading && results.map((it, idx) => (
            <div
              key={it.symbol}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer ${idx===selectedIdx?'bg-gray-100':''}`}
              onClick={() => go(it.symbol)}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{it.symbol}</span>
                <span className="text-gray-500">{it.name}</span>
              </div>
              <button
                aria-label="favori"
                className="text-xs text-blue-600"
                onClick={(e)=>{ e.stopPropagation(); toggleFavorite(it.symbol); }}
              >
                {favorites.includes(it.symbol) ? '★' : '☆'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
