import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Position, PortfolioSummary, WatchItem } from '@/lib/validation';

interface PortfolioState {
  // Portfolio data
  positions: Position[];
  summary: PortfolioSummary | null;
  watchlist: WatchItem[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPositions: (positions: Position[]) => void;
  setSummary: (summary: PortfolioSummary) => void;
  addToWatchlist: (item: WatchItem) => void;
  removeFromWatchlist: (symbol: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getPosition: (symbol: string) => Position | undefined;
  getWatchItem: (symbol: string) => WatchItem | undefined;
}

export const usePortfolioStore = create<PortfolioState>()(
  devtools(
    (set, get) => ({
      positions: [],
      summary: null,
      watchlist: [],
      isLoading: false,
      error: null,

      setPositions: (positions) => set({ positions }),
      setSummary: (summary) => set({ summary }),
      
      addToWatchlist: (item) => set((state) => ({
        watchlist: [...state.watchlist.filter(w => w.symbol !== item.symbol), item]
      })),
      
      removeFromWatchlist: (symbol) => set((state) => ({
        watchlist: state.watchlist.filter(w => w.symbol !== symbol)
      })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      getPosition: (symbol) => get().positions.find(p => p.symbol === symbol),
      getWatchItem: (symbol) => get().watchlist.find(w => w.symbol === symbol),
    }),
    { name: 'portfolio-store' }
  )
);
