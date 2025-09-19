'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavLink from '@/components/NavLink';
import ThemeToggle from '@/components/ThemeToggle';
import { combos, onKey } from '@/lib/shortcuts';
import { Toasts } from '@/lib/toast/ToastService';
import { useUI } from '@/state/uiStore';

export default function Navbar() {
  const router = useRouter();
  const { setPaletteOpen } = useUI();
  const inputRef = useRef<HTMLInputElement>(null);
  const [sym, setSym] = useState('');

  useEffect(() => {
    const off = onKey(document, combos.slash, () => inputRef.current?.focus());
    return () => off();
  }, []);

  function go() {
    const s = (sym || '').trim().toUpperCase();
    if (!s) return;
    Toasts.show(`Ouverture ${s}`, 'Chargement du graphe…', 1500);
    router.push(`/symbol/${encodeURIComponent(s)}`);
    setSym('');
  }

  // Raccourcis "g x"
  useEffect(() => {
    let chord = '';
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'g') { chord = 'g'; setTimeout(() => chord='', 700); return; }
      if (chord === 'g') {
        e.preventDefault();
        const k = e.key.toLowerCase();
        if (k === 'h') router.push('/');            // Home
        if (k === 'r') router.push('/search');      // Recherche
        if (k === 's') router.push('/screener');    // Screener
        if (k === 'p') router.push('/portfolio');   // Portfolio
        if (k === 'a') router.push('/alerts');      // Alerts
        if (k === 'm') router.push('/lab/middleware'); // Middleware
        if (k === 'f') router.push('/lab/performance'); // Performance
        if (k === 'i') router.push('/lab/ai-systems'); // AI Systems
        if (k === 'o') router.push('/lab/roi-overview'); // ROI Overview
        chord = '';
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  return (
    <nav className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur dark:bg-gray-900/80">
      <div className="mx-auto max-w-[1400px] px-4">
        <div className="h-14 flex items-center gap-3">
          {/* Logo / Home */}
          <button
            onClick={() => router.push('/')}
            className="mr-1 text-base font-bold tracking-tight text-gray-900 dark:text-white"
            aria-label="Accueil"
          >
            Alpaca IQ
          </button>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" exact>Accueil</NavLink>
            <NavLink href="/search">Recherche</NavLink>
            <NavLink href="/screener">Screener</NavLink>
            <NavLink href="/symbol">Charts</NavLink>
            <NavLink href="/portfolio">Portfolio</NavLink>
            <NavLink href="/advisor/dashboard">Mon Conseiller</NavLink>
            <NavLink href="/alerts/personal">Mes Alertes</NavLink>
            <NavLink href="/history">Historique</NavLink>
            <NavLink href="/lab/middleware">Middleware</NavLink>
            <NavLink href="/lab/performance">Performance</NavLink>
            <NavLink href="/lab/ai-systems">AI Systems</NavLink>
            <NavLink href="/lab/roi-overview">ROI Overview</NavLink>
          </div>

          {/* Recherche rapide */}
          <div className="ml-auto flex items-center gap-2 w-full sm:w-auto sm:min-w-[340px]">
            <div className="relative flex-1 sm:flex-none">
              <input
                ref={inputRef}
                value={sym}
                onChange={e => setSym(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && go()}
                placeholder="Aller à un symbole… (Appuie sur /)"
                className="w-full sm:w-[320px] rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none dark:bg-gray-800 dark:text-gray-100"
                aria-label="Rechercher un symbole"
              />
              <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">Enter</div>
            </div>

            {/* Command Palette Button */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden sm:inline rounded-md border px-2 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              title="Ouvrir la palette (Cmd/Ctrl+K)"
            >
              ⌘K
            </button>

            {/* Badge alertes (placeholder: calc dynamique possible) */}
            <div className="relative">
              <button
                className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => router.push('/alerts')}
                aria-label="Ouvrir les alertes"
              >
                Alerts
              </button>
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                3
              </span>
            </div>

            <ThemeToggle />

            {/* User menu (placeholder) */}
            <button
              onClick={() => router.push('/settings')}
              className="rounded-full border w-8 h-8 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-label="Paramètres / Compte"
              title="Paramètres / Compte"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
