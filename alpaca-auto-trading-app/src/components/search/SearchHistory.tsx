'use client';
import { useEffect, useState } from 'react';

type SearchHistoryItem = {
  query: string;
  timestamp: number;
  results: number;
};

export default function SearchHistory({ onSelect }: { onSelect: (query: string) => void }) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('search_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const addToHistory = (query: string, results: number) => {
    const newItem: SearchHistoryItem = {
      query,
      timestamp: Date.now(),
      results
    };
    
    const updated = [newItem, ...history.filter(h => h.query !== query)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('search_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('search_history');
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  if (history.length === 0) return null;

  return (
    <div className="ds-card p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Recherches récentes</h3>
        <button 
          onClick={clearHistory}
          className="text-xs text-gray-400 hover:text-gray-300"
        >
          Effacer
        </button>
      </div>
      <div className="space-y-1">
        {history.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelect(item.query)}
            className="w-full text-left p-2 rounded hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">{item.query}</span>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{item.results} résultats</span>
                <span>•</span>
                <span>{formatTime(item.timestamp)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Export the function to add to history
export { SearchHistory };
