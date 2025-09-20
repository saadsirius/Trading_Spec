// FILE: src/state/uiStore.ts
// Tiny global UI store without external deps (SSR-safe).
// Exports: useUI (selector?), UI actions.

import { useSyncExternalStore } from 'react';

type UIState = {
  isPaletteOpen: boolean;
  isSidebarOpen: boolean;
};

type UIActions = {
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

const state: UIState = {
  isPaletteOpen: false,
  isSidebarOpen: false,
};

const listeners = new Set<() => void>();
function emit() { listeners.forEach(l => l()); }

const actions: UIActions = {
  openPalette:  () => { state.isPaletteOpen = true;  emit(); },
  closePalette: () => { state.isPaletteOpen = false; emit(); },
  togglePalette:() => { state.isPaletteOpen = !state.isPaletteOpen; emit(); },

  openSidebar:  () => { state.isSidebarOpen = true;  emit(); },
  closeSidebar: () => { state.isSidebarOpen = false; emit(); },
  toggleSidebar:() => { state.isSidebarOpen = !state.isSidebarOpen; emit(); },
};

type Selector<T> = (s: UIState & UIActions) => T;

export function useUI<T = UIState & UIActions>(selector?: Selector<T>): T {
  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  };

  const getSnapshot = () => ({ ...state, ...actions }) as UIState & UIActions;

  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  // Default: return full store; else selected
  return (selector ? selector(snap) : (snap as unknown)) as T;
}

// Named exports for convenience
export const ui = { ...actions };