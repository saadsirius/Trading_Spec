export type WLItem = { symbol: string; ts: number };
const KEY = 'watchlist_v1';
function load(): WLItem[] { try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; } }
function save(it: WLItem[]) { try { localStorage.setItem(KEY, JSON.stringify(it)); } catch {} }
export const Watchlist = {
  get(): WLItem[] { return load(); },
  has(symbol: string) { return load().some(x => x.symbol === symbol); },
  add(symbol: string) { const now = Date.now(); const s = load().filter(x=>x.symbol!==symbol); s.unshift({ symbol, ts: now }); save(s.slice(0,200)); return true; },
  remove(symbol: string) { save(load().filter(x=>x.symbol!==symbol)); return true; },
  toggle(symbol: string) { return this.has(symbol) ? (this.remove(symbol), false) : (this.add(symbol), true); }
};
