'use client';
import { useMemo, useState } from 'react';
import SearchBar from '@/src/components/search/SearchBar';
import TickerCard from '@/src/components/search/TickerCard';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const [items, setItems] = useState<any[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const router = useRouter();

  return (
    <div className="p-5 space-y-4">
      <h1 className="text-xl font-semibold">Recherche</h1>
      <SearchBar onResults={setItems} />
      
      {compare.length > 0 && (
        <div className="ds-card p-2 flex items-center gap-2">
          <div className="text-xs text-gray-400">Comparateur:</div>
          {compare.map(s => (
            <span key={s} className="badge">{s}</span>
          ))}
          <button 
            className="badge" 
            onClick={() => router.push(`/compare?symbols=${compare.join(',')}`)}
          >
            Ouvrir
          </button>
          <button 
            className="badge" 
            onClick={() => setCompare([])}
          >
            Reset
          </button>
        </div>
      )}

      <div className="grid-auto">
        {items.map((it: any) => (
          <TickerCard 
            key={it.symbol} 
            item={it}
            onAddWatch={(s) => { 
              fetch('/api/watchlist/add', { 
                method: 'POST', 
                headers: { 'content-type': 'application/json' }, 
                body: JSON.stringify({ symbol: s }) 
              }); 
            }}
            onCompare={(s) => setCompare(prev => Array.from(new Set([...prev, s])).slice(0, 6))}
            onAlert={(s) => { 
              fetch('/api/alerts/create', { 
                method: 'POST', 
                headers: { 'content-type': 'application/json' }, 
                body: JSON.stringify({ symbol: s, rule: 'price_cross_donchian_20' }) 
              }); 
            }}
          />
        ))}
      </div>
    </div>
  );
}
