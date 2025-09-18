import { useQuery } from '@tanstack/react-query';

export function useIndices(universe: string[] = ['SPY','QQQ','DIA','IWM']) {
  return useQuery({
    queryKey: ['indices', universe],
    queryFn: async () => {
      // Compose depuis tes routes Alpaca bars/snapshots
      const url = `/api/alpaca/market/bars?symbols=${universe.join(',')}&timeframe=1Day&limit=2`;
      const j = await (await fetch(url)).json();
      const bars = j?.bars ?? {};
      const out = universe.map(s => {
        const arr = bars[s] ?? [];
        const last = arr[arr.length-1]; const prev = arr[arr.length-2];
        const px = last?.c ?? 0; const ch = prev ? ((last.c - prev.c)/prev.c) : 0;
        return { symbol: s, price: px, changePct: ch };
      });
      return out;
    },
    refetchInterval: 30_000,
  });
}

export function useSymbolsSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: async () => {
      const j = await (await fetch(`/api/alpaca/assets?q=${encodeURIComponent(q)}&limit=50`)).json();
      return j.items ?? [];
    },
    enabled: q.trim().length > 0
  });
}
