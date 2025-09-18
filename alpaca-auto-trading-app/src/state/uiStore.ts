import { create } from 'zustand';

type UIState = {
  paletteOpen: boolean;
  setPaletteOpen: (b: boolean) => void;

  aiPanelOpen: boolean;
  setAiPanelOpen: (b: boolean) => void;

  // Chart state (contexte /symbol)
  timeframe: string;              // ex: '5Min' | '15Min' | '1Day'
  setTimeframe: (tf: string) => void;
  donchian20: boolean;
  toggleDonchian20: () => void;
  currentSymbol?: string;
  setCurrentSymbol: (s?: string) => void;

  rightTab?: 'alerts'|'log';
  setRightTab?: (t: UIState['rightTab']) => void;
};

export const useUI = (globalThis as any).__uiStore ?? ((globalThis as any).__uiStore = create<UIState>((set) => ({
  paletteOpen: false,
  setPaletteOpen: (b) => set({ paletteOpen: b }),

  aiPanelOpen: false,
  setAiPanelOpen: (b) => set({ aiPanelOpen: b }),

  timeframe: '5Min',
  setTimeframe: (tf) => set({ timeframe: tf }),
  donchian20: false,
  toggleDonchian20: () => set(s => ({ donchian20: !s.donchian20 })),
  currentSymbol: undefined,
  setCurrentSymbol: (s) => set({ currentSymbol: s }),

  rightTab: undefined,
  setRightTab: (t) => set({ rightTab: t }),
})));
