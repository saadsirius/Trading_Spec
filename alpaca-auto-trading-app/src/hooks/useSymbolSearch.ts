'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Analytics } from '@/lib/analytics/Analytics';
import { Toasts } from '@/lib/toast/ToastService';

export type SymbolItem = { symbol: string; name: string; exchange: string };

export function useSymbolSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<SymbolItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [favorites, setFavorites] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('favSyms') ?? '[]'); } catch { return []; }});
  const debounce = useRef<number>();

  useEffect(() => { localStorage.setItem('favSyms', JSON.stringify(favorites)); }, [favorites]);

  useEffect(() => {
    window.clearTimeout(debounce.current);
    setLoading(true);
    debounce.current = window.setTimeout(async () => {
      const r = await fetch(`/api/alpaca/assets?q=${encodeURIComponent(q)}&limit=50`);
      const data = await r.json();
      setItems(data.items ?? []);
      setLoading(false);
      setSelectedIdx(0);
    }, 150);
    return () => window.clearTimeout(debounce.current);
  }, [q]);

  const results = q ? items.filter(item => 
    item.symbol.toLowerCase().includes(q.toLowerCase()) || 
    item.name.toLowerCase().includes(q.toLowerCase())
  ) : items;

  function go(sym: string) {
    Analytics.emit({ type:'search_select', symbol: sym });
    Toasts.showById('nav', `Ouverture ${sym}`, 'Chargement du graphe…', 2000);
    router.push(`/symbol/${encodeURIComponent(sym)}`);
  }

  return {
    q, setQ, results, loading, selectedIdx, setSelectedIdx, favorites,
    toggleFavorite: (sym: string) => setFavorites(f => f.includes(sym) ? f.filter(x=>x!==sym) : [...f, sym]),
    go,
  };
}
