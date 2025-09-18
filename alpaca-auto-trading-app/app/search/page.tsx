'use client';
import { useMemo, useState } from 'react';
import SearchBar from '@/src/components/search/SearchBar';
import TickerCard from '@/src/components/search/TickerCard';
import SearchHistory from '@/src/components/search/SearchHistory';
import SearchFilters from '@/src/components/search/SearchFilters';
import SearchResultsSummary from '@/src/components/search/SearchResultsSummary';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const [items, setItems] = useState<any[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const handleResults = (results: any[]) => {
    setItems(results);
    setLoading(false);
  };

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    if (newQuery) {
      setLoading(true);
    }
  };

  const handleHistorySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
    setLoading(true);
  };

  const filteredItems = useMemo(() => {
    if (!filters) return items;
    
    return items.filter(item => {
      // Type filter
      if (filters.type?.length > 0 && !filters.type.includes(item.type)) {
        return false;
      }
      
      // Price filter
      if (filters.minPrice && item.price && item.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && item.price && item.price > filters.maxPrice) {
        return false;
      }
      
      // Volume filter
      if (filters.minVolume && item.volumeAvg && item.volumeAvg < filters.minVolume) {
        return false;
      }
      
      // Change filter
      if (filters.minChange && item.change1d && item.change1d * 100 < filters.minChange) {
        return false;
      }
      if (filters.maxChange && item.change1d && item.change1d * 100 > filters.maxChange) {
        return false;
      }
      
      // ESG filter
      if (filters.esgGrade?.length > 0 && item.esg?.grade && !filters.esgGrade.includes(item.esg.grade)) {
        return false;
      }
      
      return true;
    });
  }, [items, filters]);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recherche</h1>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="badge"
        >
          {showFilters ? 'Masquer filtres' : 'Filtres'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <SearchBar onResults={handleResults} onQueryChange={handleQueryChange} />
          
          <SearchResultsSummary 
            query={query} 
            results={filteredItems} 
            loading={loading}
            filters={filters}
          />
          
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
            {filteredItems.map((it: any) => (
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
        
        <div className="space-y-4">
          <SearchHistory onSelect={handleHistorySelect} />
          <SearchFilters 
            onFiltersChange={setFilters}
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
        </div>
      </div>
    </div>
  );
}
