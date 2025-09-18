'use client';
import { create } from 'zustand';

type Snapshot<T> = { at: number; state: T };
type TTState<T> = {
  state: T;
  history: Snapshot<T>[];
  set: (u: Partial<T>) => void;
  rewind: (steps?: number) => void;
  clear: () => void;
};

export function makeTimeTravelStore<T extends object>(initial: T) {
  return create<TTState<T>>((set, get) => ({
    state: initial,
    history: [],
    set(u) {
      const next = { ...get().state, ...u } as T;
      const hist = [...get().history, { at: Date.now(), state: get().state }];
      set({ state: next, history: hist.slice(-50) });
    },
    rewind(steps = 1) {
      const hist = get().history.slice(0, -steps);
      const prev = get().history.at(-steps)?.state ?? get().state;
      set({ state: prev, history: hist });
    },
    clear() { set({ history: [] }); }
  }));
}

// Exemple: store "ui" pour préférences d'affichage
export type UIState = { timeframe: '1D' | '1H' | '15m' | '5m'; denseMode: boolean; mood: number };
export const useUI = makeTimeTravelStore<UIState>({ timeframe: '1D', denseMode: false, mood: 0.2 });
