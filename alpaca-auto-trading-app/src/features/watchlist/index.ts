/**
 * Watchlist réactive avec sentiment/alertes.
 * À brancher à ton Event Bus (QUOTE_TICK / ALERT).
 */
import { create } from "zustand";
import type { Alert } from "@/core/domain";

type WLItem = { symbol: string; notes?: string; pinned?: boolean; sentiment?: number | null; last?: number | null; };
type WLState = {
  list: Record<string, WLItem>;
  add: (symbol: string, part?: Partial<WLItem>) => void;
  remove: (symbol: string) => void;
  setSentiment: (symbol: string, val: number | null) => void;
  setLast: (symbol: string, val: number | null) => void;
  onAlert: (a: Alert) => void;
};

export const useWatchlist = create<WLState>((set, get) => ({
  list: {},
  add(symbol, part) { set(s => { s.list[symbol] = { symbol, ...part }; }); },
  remove(symbol)    { set(s => { delete s.list[symbol]; }); },
  setSentiment(symbol, val){ set(s => { if(s.list[symbol]) s.list[symbol].sentiment = val; }); },
  setLast(symbol, val){ set(s => { if(s.list[symbol]) s.list[symbol].last = val; }); },
  onAlert(a)        { set(s => { const sym = a.signal.instrument.symbol; if(!s.list[sym]) s.list[sym] = { symbol: sym }; }); },
}));
