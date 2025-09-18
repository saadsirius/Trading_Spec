export function onKey(el: HTMLElement | Document, combo: (e: KeyboardEvent) => boolean, handler: (e: KeyboardEvent)=>void) {
  const fn = (e: KeyboardEvent) => { if (combo(e)) { e.preventDefault(); handler(e); } };
  el.addEventListener('keydown', fn as any);
  return () => el.removeEventListener('keydown', fn as any);
}
export const combos = {
  palette: (e: KeyboardEvent) => (e.key.toLowerCase()==='k') && (e.metaKey || e.ctrlKey),
  help:    (e: KeyboardEvent) => e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey, // presse ? (sur clavier FR: Shift+/)
  slash:   (e: KeyboardEvent) => e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey,
};
