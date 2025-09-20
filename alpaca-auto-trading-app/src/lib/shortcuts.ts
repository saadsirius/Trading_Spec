export type KeyCombo = string | string[];

export const combos = {
  openPalette: ['meta', 'k'] as string[],  // ⌘K
  openPaletteAlt: ['control', 'k'] as string[], // Ctrl+K
  close: ['escape'] as string[],
  help: ['shift', 'slash'] as string[], // Shift+/
};

export function onKey(combo: KeyCombo, handler: () => void) {
  if (typeof window === 'undefined') return () => {};

  const parts = Array.isArray(combo)
    ? combo.map((k) => k.toLowerCase())
    : combo.toLowerCase().split('+').map((k) => k.trim());

  const listener = (e: KeyboardEvent) => {
    const need = {
      meta: parts.includes('meta'),
      ctrl: parts.includes('control') || parts.includes('ctrl'),
      shift: parts.includes('shift'),
      alt: parts.includes('alt') || parts.includes('option'),
    };
    const main = parts.find(
      (k) => !['meta', 'control', 'ctrl', 'shift', 'alt', 'option'].includes(k),
    );

    const ok =
      (!need.meta || e.metaKey) &&
      (!need.ctrl || e.ctrlKey) &&
      (!need.shift || e.shiftKey) &&
      (!need.alt || e.altKey) &&
      (!main || e.key.toLowerCase() === main.toLowerCase());

    if (ok) {
      e.preventDefault();
      handler();
    }
  };

  window.addEventListener('keydown', listener);
  return () => window.removeEventListener('keydown', listener);
}