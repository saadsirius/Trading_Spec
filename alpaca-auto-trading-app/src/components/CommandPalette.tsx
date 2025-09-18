'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUI } from '@/state/uiStore';
import { combos, onKey } from '@/lib/shortcuts';
import { Toasts } from '@/lib/toast/ToastService';
import { Analytics } from '@/lib/analytics/Analytics';
import { commandRegistry, type Command } from '@/lib/commands/registry';
import { Watchlist } from '@/lib/watchlist/WatchlistService';

type AssetLite = { symbol: string; name?: string; exchange?: string };

const HIST_KEY = 'cmd_history_v1';
const PIN_KEY = 'cmd_pins_v1';

function loadHistory(): string[] { try { return JSON.parse(localStorage.getItem(HIST_KEY) ?? '[]'); } catch { return []; } }
function saveHistory(ids: string[]) { try { localStorage.setItem(HIST_KEY, JSON.stringify(ids.slice(0,10))); } catch {} }
function loadPins(): string[] { try { return JSON.parse(localStorage.getItem(PIN_KEY) ?? '[]'); } catch { return []; } }
function savePins(ids: string[]) { try { localStorage.setItem(PIN_KEY, JSON.stringify(ids.slice(0,10))); } catch {} }

let inflightAbort: AbortController | null = null;
async function fetchSymbols(q: string): Promise<AssetLite[]> {
  if (!q) return [];
  inflightAbort?.abort();
  inflightAbort = new AbortController();
  const r = await fetch(`/api/alpaca/assets?q=${encodeURIComponent(q)}&limit=20`, { signal: inflightAbort.signal });
  const j = await r.json().catch(()=>({items:[]}));
  return (j.items ?? []) as AssetLite[];
}

function useCurrentSymbolFromPath(): string | null {
  const path = usePathname() || '';
  const parts = path.split('/').filter(Boolean);
  const i = parts.findIndex(p => p === 'symbol');
  if (i >= 0 && parts[i+1]) return decodeURIComponent(parts[i+1]).toUpperCase();
  return null;
}

export default function CommandPalette() {
  const { paletteOpen, setPaletteOpen, setTimeframe, toggleDonchian20, setAiPanelOpen, setCurrentSymbol } = useUI();
  const router = useRouter();
  const pathname = usePathname();
  const currentSymbol = useCurrentSymbolFromPath();
  useEffect(()=>{ setCurrentSymbol(currentSymbol ?? undefined); }, [currentSymbol, setCurrentSymbol]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const [symbolResults, setSymbolResults] = useState<AssetLite[]>([]);
  const [loading, setLoading] = useState(false);

  // a11y live region
  const liveRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (liveRef.current) liveRef.current.textContent = `${symbolResults.length} résultats`; }, [symbolResults.length]);

  // Ouvrir/fermer
  useEffect(() => {
    const off = onKey(document, combos.palette, () => setPaletteOpen(true));
    return () => off();
  }, [setPaletteOpen]);

  // Focus input
  useEffect(() => { if (paletteOpen) setTimeout(()=>inputRef.current?.focus(), 0); else { setQ(''); setIdx(0); setSymbolResults([]); } }, [paletteOpen]);

  // Recherche symboles (debounce)
  useEffect(() => {
    let stop = false;
    const t = setTimeout(async () => {
      if (!q.trim()) { setSymbolResults([]); return; }
      setLoading(true);
      const items = await fetchSymbols(q.trim()).catch(()=>[]);
      if (!stop) { setSymbolResults(items); setLoading(false); setIdx(0); }
    }, 140);
    return () => { stop = true; clearTimeout(t); };
  }, [q]);

  // Historique & pins
  const [history, setHistory] = useState<string[]>([]);
  const [pins, setPins] = useState<string[]>([]);
  useEffect(()=>{ setHistory(loadHistory()); setPins(loadPins()); }, []);
  function pushHistory(id: string) {
    const next = [id, ...history.filter(x=>x!==id)].slice(0,10);
    setHistory(next); saveHistory(next);
  }
  function togglePin(id: string) {
    const next = pins.includes(id) ? pins.filter(x=>x!==id) : [id, ...pins].slice(0,10);
    setPins(next); savePins(next);
  }

  // Commandes statiques/globales via registry
  // (Exemples d'enregistrement à placer dans des modules Screener/Portfolio ultérieurement)
  useEffect(() => {
    // Nettoyage et enregistrement contextuel minimal (idempotent)
    commandRegistry.add({
      id: 'nav-home',
      title: 'Aller à Accueil',
      subtitle: '/',
      run: () => router.push('/'),
      tags: ['nav','home'],
      weight: 1,
    });
    commandRegistry.add({ id: 'nav-screener', title: 'Ouvrir Screener', subtitle:'/screener', run: ()=>router.push('/screener'), tags:['nav','screener'], weight:1 });
    commandRegistry.add({ id: 'nav-portfolio', title: 'Voir Portfolio', subtitle:'/portfolio', run: ()=>router.push('/portfolio'), tags:['nav'], weight:1 });
    commandRegistry.add({ id: 'nav-advisor', title: 'Mon Conseiller Financier', subtitle:'/advisor/dashboard', run: ()=>router.push('/advisor/dashboard'), tags:['nav','advisor'], weight:1 });
    commandRegistry.add({ id: 'nav-alerts-personal', title: 'Mes Alertes Personnelles', subtitle:'/alerts/personal', run: ()=>router.push('/alerts/personal'), tags:['nav','alerts'], weight:1 });
    commandRegistry.add({ id: 'nav-history', title: 'Voir Historique', subtitle:'/history', run: ()=>router.push('/history'), tags:['nav'], weight:1 });
    commandRegistry.add({ id: 'nav-ai-suggestions', title: 'AI Suggestions & Analysis (marché)', subtitle:'/ai/suggestions', run: ()=>router.push('/ai/suggestions'), tags:['ai','analysis'], weight:1 });
  }, [router]);

  // Commandes contextuelles /symbol
  useEffect(() => {
    const sym = currentSymbol;
    if (!sym) return;
    commandRegistry.add({ id: 'ctx-tf-5m',  title: 'Changer timeframe → 5m',  run: ()=>setTimeframe('5Min'), when: ()=>pathname.startsWith('/symbol/'), tags:['tf'], weight:2 });
    commandRegistry.add({ id: 'ctx-tf-15m', title: 'Changer timeframe → 15m', run: ()=>setTimeframe('15Min'), when: ()=>pathname.startsWith('/symbol/'), tags:['tf'], weight:2 });
    commandRegistry.add({ id: 'ctx-tf-1d',  title: 'Changer timeframe → 1D',  run: ()=>setTimeframe('1Day'), when: ()=>pathname.startsWith('/symbol/'), tags:['tf'], weight:2 });
    commandRegistry.add({
      id: 'ctx-watchlist-toggle',
      title: Watchlist.has(sym) ? `Retirer ${sym} du watchlist` : `Ajouter ${sym} au watchlist`,
      run: () => { const on = Watchlist.toggle(sym); Toasts.show(on?`Ajouté ${sym}`:`Retiré ${sym}`); },
      when: ()=>pathname.startsWith('/symbol/'), tags:['watchlist'], weight:2
    });
    commandRegistry.add({
      id: 'ctx-donchian-20',
      title: 'Tracer Donchian 20 (toggle)',
      run: () => toggleDonchian20(),
      when: ()=>pathname.startsWith('/symbol/'), tags:['overlay','donchian'], weight:2
    });
    commandRegistry.add({
      id: 'ai-explain',
      title: 'Expliquer le signal courant (AI)',
      run: ()=> setAiPanelOpen(true),
      when: ()=>pathname.startsWith('/symbol/'), tags:['ai'], weight:3
    });
    commandRegistry.add({
      id: 'ai-backtest-mini',
      title: 'Simuler trade (backtest court)',
      run: ()=> setAiPanelOpen(true),
      when: ()=>pathname.startsWith('/symbol/'), tags:['ai','backtest'], weight:3
    });
  }, [currentSymbol, pathname, setTimeframe, toggleDonchian20, setAiPanelOpen]);

  // Fusion des commandes
  const baseCommands = commandRegistry.list().filter(c => !c.when || c.when());
  // Recherche textuelle naïve (q dans title/subtitle/tags)
  const searched = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return baseCommands;
    return baseCommands
      .map(c => ({ c, score:
        (c.title.toLowerCase().includes(t) ? 2 : 0) +
        (c.subtitle?.toLowerCase().includes(t) ? 1 : 0) +
        (c.tags?.some(x=>x.toLowerCase().includes(t)) ? 1 : 0)
      }))
      .filter(x => x.score > 0)
      .sort((a,b) => (b.score - a.score) || ((b.c.weight ?? 0) - (a.c.weight ?? 0)))
      .map(x => x.c);
  }, [baseCommands, q]);

  // Commandes symboles dynamiques (toujours en tête quand q tape un symbole)
  const symbolCommands: Command[] = useMemo(() => {
    return symbolResults.map((s, i) => ({
      id: `sym-${s.symbol}-${i}`,
      title: s.symbol,
      subtitle: s.name ? `${s.name}${s.exchange ? ' · '+s.exchange : ''}` : (s.exchange ?? ''),
      tags: ['sym'],
      run: () => {
        Toasts.show(`Ouverture ${s.symbol}`, s.name ?? '');
        Analytics.emit({ type:'search_select', symbol: s.symbol });
        router.push(`/symbol/${encodeURIComponent(s.symbol)}`);
        setPaletteOpen(false);
      }
    }));
  }, [symbolResults, router, setPaletteOpen]);

  // Ordre final : pins (si q vide) → symboles (si q) → historiques (si q vide) → résultats recherchés
  const finalCommands: Command[] = useMemo(() => {
    if (q) return [...symbolCommands, ...searched];
    const pinCmds = pins.map(id => baseCommands.find(c => c.id === id)).filter(Boolean) as Command[];
    const histCmds = history.map(id => baseCommands.find(c => c.id === id)).filter(Boolean) as Command[];
    // Retirer doublons pin vs hist
    const histFiltered = histCmds.filter(h => !pinCmds.some(p => p.id === h.id));
    return [...pinCmds, ...histFiltered, ...baseCommands];
  }, [q, symbolCommands, searched, baseCommands, pins, history]);

  // Gestion clavier
  useEffect(() => {
    if (!paletteOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPaletteOpen(false);
      if (e.key === 'ArrowDown') setIdx((i) => Math.min(i + 1, finalCommands.length - 1));
      if (e.key === 'ArrowUp') setIdx((i) => Math.max(i - 1, 0));
      if (e.key === 'Enter') {
        const c = finalCommands[idx];
        if (c) { pushHistory(c.id); c.run(); setPaletteOpen(false); }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [paletteOpen, finalCommands, idx, setPaletteOpen]);

  if (!paletteOpen) return null;

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Commande rapide"
      className="fixed inset-0 z-[60] flex items-start justify-center p-4 bg-black/30"
      onClick={() => setPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-lg border bg-white shadow-lg dark:bg-gray-900 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b p-2">
          <input
            ref={inputRef}
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Tape un symbole (AAPL) ou une commande…"
            className="w-full bg-transparent px-3 py-2 text-sm outline-none"
            aria-label="Zone de recherche de la palette"
          />
        </div>
        <div className="max-h-[60vh] overflow-auto py-2">
          <div className="sr-only" aria-live="polite" ref={liveRef} />
          {loading && <div className="px-3 py-2 text-sm text-gray-500">Chargement…</div>}
          {!loading && finalCommands.length===0 && (<div className="px-3 py-2 text-sm text-gray-500">Aucun résultat</div>)}
          {!loading && finalCommands.map((c, i) => {
            const pinned = pins.includes(c.id);
            return (
              <div
                id={c.id}
                key={c.id}
                role="button"
                aria-pressed={i===idx}
                onMouseEnter={()=>setIdx(i)}
                onClick={()=>{ pushHistory(c.id); c.run(); setPaletteOpen(false); }}
                className={[
                  "px-3 py-2 cursor-pointer text-sm flex items-center justify-between",
                  i===idx ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.title}</span>
                  {c.subtitle && <span className="text-gray-500">{c.subtitle}</span>}
                </div>
                <button
                  aria-label={pinned ? 'Retirer des favoris' : 'Épingler'}
                  className="text-xs text-yellow-600"
                  onClick={(e)=>{ e.stopPropagation(); togglePin(c.id); }}
                >
                  {pinned ? '★' : '☆'}
                </button>
              </div>
            );
          })}
        </div>
        <div className="border-t px-3 py-1.5 text-[11px] text-gray-500 flex items-center justify-between">
          <span>Cmd/Ctrl+K pour ouvrir • Esc pour fermer</span>
          <span>Flèches ↑↓ • Entrée • ⭐ épingle</span>
        </div>
      </div>
    </div>
  );
}