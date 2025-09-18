'use client';
import { useEffect, useRef, useState } from 'react';

export default function SearchBar({ onResults }: { onResults: (items: any[]) => void }) {
  const [q, setQ] = useState('');
  const [suggest, setSuggest] = useState<any[]>([]);
  const t = useRef<any>(null);

  useEffect(() => {
    if (!q) { 
      setSuggest([]); 
      onResults([]); 
      return; 
    }
    
    const id = setTimeout(async () => {
      const s = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .catch(() => ({ items: [] }));
      setSuggest(s.items || []);
      
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .catch(() => ({ items: [] }));
      onResults(r.items || []);
    }, 180);
    
    return () => clearTimeout(id);
  }, [q, onResults]);

  return (
    <div className="ds-card p-2">
      <input 
        autoFocus 
        placeholder="Rechercher (AAPL, BTC, 'NVIDIA'…)" 
        value={q} 
        onChange={e => setQ(e.target.value)}
        className="w-full bg-transparent outline-none px-2 py-2"
      />
      {suggest.length > 0 && (
        <div className="mt-2 grid grid-cols-2 gap-1">
          {suggest.map((s: any) => (
            <button 
              key={s.symbol} 
              className="badge" 
              onClick={() => setQ(s.symbol)}
            >
              {s.symbol} · {s.name || s.type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
