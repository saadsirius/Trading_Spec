export type KeyCombo = string | string[];

export const combos = {
  openPalette: ['meta', 'k'],
  openPaletteAlt: ['control', 'k'],
  close: ['escape'],
  help: ['meta', '/'],
};

export function onKey(combo: KeyCombo, handler: () => void) {
  if (typeof window === 'undefined') return () => {};
  const parts = Array.isArray(combo) ? combo : combo.split('+').map(s => s.trim().toLowerCase());
  const listener = (e: KeyboardEvent) => {
    const need = (k: string) => parts.includes(k);
    const main = parts.find(k => !['meta','control','ctrl','shift','alt','option'].includes(k));
    const ok =
      (!need('meta') || e.metaKey) &&
      (!need('control') && !need('ctrl') || e.ctrlKey) &&
      (!need('shift') || e.shiftKey) &&
      (!need('alt') && !need('option') || e.altKey) &&
      (!main || e.key.toLowerCase() === main);
    if (ok) { e.preventDefault(); handler(); }
  };
  window.addEventListener('keydown', listener);
  return () => window.removeEventListener('keydown', listener);
}
