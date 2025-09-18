import { create } from 'zustand';

export type AISettings = {
  // Scores & sélection
  wDonchian: number;   // poids 0..1
  wMomentum: number;   // poids 0..1
  wRSI: number;        // poids 0..1
  buyThreshold: number; // seuil 0..1
  universeSize: number; // nb symboles scannés

  // Backtest & exécution simulée
  feesPerTrade: number;  // coût fixe par trade (devise de la série, ex: $)
  slippagePct: number;   // 0..1 (ex: 0.001 = 0.1%)
  holdBars: number;      // nb barres à tenir

  // Batching & retries
  chunkSize: number;     // 50..100 selon plan Alpaca
  maxRetries: number;    // 0..5

  set: (p: Partial<AISettings>) => void;
};

const KEY = 'ai_settings_v1';
function load(): AISettings {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return {
      wDonchian: 0.45, wMomentum: 0.35, wRSI: 0.20,
      buyThreshold: 0.70,
      universeSize: 120,
      feesPerTrade: 0.0,
      slippagePct: 0.001,
      holdBars: 5,
      chunkSize: 100,
      maxRetries: 3,
      ...raw,
    };
  } catch { return {
    wDonchian: 0.45, wMomentum: 0.35, wRSI: 0.20,
    buyThreshold: 0.70, universeSize: 120,
    feesPerTrade: 0.0, slippagePct: 0.001, holdBars: 5,
    chunkSize: 100, maxRetries: 3,
  }; }
}
function save(p: AISettings) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {} }

export const useAISettings = create<AISettings>((set, get) => ({
  ...load(),
  set(p) { const next = { ...get(), ...p }; save(next); set(next); }
}));
