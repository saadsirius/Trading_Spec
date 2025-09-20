// No top-level document/window access to stay SSR-safe
export type KeyCombo = string | string[];

// Common combos you can reference (e.g., combos.openPalette)
export const combos = {
  openPalette: ['meta', 'k'] as string[],     // ⌘K
  openPaletteAlt: ['control', 'k'] as string[], // Ctrl+K
  close: ['escape'] as string[],
};

// Register a key handler on the client; returns an unsubscribe fn
export function onKey(combo: KeyCombo, handler: () => void) {
  if (typeof window === 'undefined') {
    // SSR no-op cleanup
    return () => {};
  }

  const parts = Array.isArray(combo)
    ? combo.map((k) => k.toLowerCase())
    : combo.toLowerCase().split('+').map((k) => k.trim());

  const listener = (e: KeyboardEvent) => {
    // modifiers
    const needMeta = parts.includes('meta');
    const needCtrl = parts.includes('control') || parts.includes('ctrl');
    const needShift = parts.includes('shift');
    const needAlt = parts.includes('alt') || parts.includes('option');

    // main key is the first non-modifier
    const main = parts.find(
      (k) => !['meta', 'control', 'ctrl', 'shift', 'alt', 'option'].includes(k)
    );

    const ok =
      (!needMeta || e.metaKey) &&
      (!needCtrl || e.ctrlKey) &&
      (!needShift || e.shiftKey) &&
      (!needAlt || e.altKey) &&
      (!main || e.key.toLowerCase() === main.toLowerCase());

    if (ok) {
      e.preventDefault();
      handler();
    }
  };

  window.addEventListener('keydown', listener);
  return () => window.removeEventListener('keydown', listener);
}