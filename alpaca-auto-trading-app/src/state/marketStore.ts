import { create } from 'zustand';

type Tick = { symbol: string; p: number; t: number; };
type MarketState = {
  ticks: Record<string, Tick>;
  setTick: (t: Tick) => void;
};

export const useMarket = create<MarketState>((set) => ({
  ticks: {},
  setTick: (t) => set((s) => ({ ticks: { ...s.ticks, [t.symbol]: t } }))
}));
