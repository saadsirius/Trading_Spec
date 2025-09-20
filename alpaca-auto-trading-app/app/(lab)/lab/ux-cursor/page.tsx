/**
 * File: app/(lab)/lab/ux-cursor/page.tsx
 * Description: UX Cursor & RNN Lab — safe WebComponent load, rAF-throttled tooltip,
 *              debounced ROI, resilient Houdini worklet init, and a11y polish.
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import CursorSystem, { showTooltip, hideTooltip } from '@/components/cursor/CursorSystem';
import { WatchlistDnD } from '@/components/dnd/WatchlistDnD';
import { useDynamicRNN } from '@/hooks/useDynamicRNN';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
type Sample = [don: number, momentum: number, rsi: number, sentiment: number, growth: number, deltaCPI: number];
type Seq = Sample[];

// ────────────────────────────────────────────────────────────
/** Safe dynamic loader for the <ai-sparkline> Web Component. */
const AISparkline = dynamic(
  async () => {
    if (typeof window !== 'undefined') {
      // Register once if not already
      try {
        // Some bundlers re-run modules; guard against double-define
        const tag = 'ai-sparkline';
        const defined = (window as any).customElements?.get?.(tag);
        if (!defined) {
          await import('@/webc/ai-sparkline');
        }
      } catch {
        // noop: keep page usable without sparkline
      }
    }
    // Component itself is a native custom element used inline
    return () => null;
  },
  { ssr: false }
);

// ────────────────────────────────────────────────────────────
/** rAF-throttled mousemove handler to keep tooltip smooth and cheap. */
function useRafMouse<T extends HTMLElement>(
  onMove: (x: number, y: number) => void
) {
  const frame = useRef<number | null>(null);
  const last = useRef<{ x: number; y: number } | null>(null);

  const handle = useCallback((e: React.MouseEvent<T>) => {
    last.current = { x: e.clientX, y: e.clientY };
    if (frame.current === null) {
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const v = last.current;
        if (v) onMove(v.x, v.y);
      });
    }
  }, [onMove]);

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  return handle;
}

// ────────────────────────────────────────────────────────────
/** Debounce a value — used to avoid re-scoring RNN on every keystroke/tick. */
function useDebounced<T>(value: T, delay = 150) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

// ────────────────────────────────────────────────────────────
/** Initialize CSS Houdini paint worklet (best-effort, safe in all browsers). */
function useHoudiniWorklet(url = '/worklets/gradient.js') {
  useEffect(() => {
    try {
      // @ts-expect-error - CSS.paintWorklet is experimental
      if (typeof CSS !== 'undefined' && CSS.paintWorklet?.addModule) {
        // @ts-expect-error
        CSS.paintWorklet.addModule(url).catch(() => {});
      }
    } catch {}
  }, [url]);
}

// ────────────────────────────────────────────────────────────
/** Prefetch tracker import tied to anchor ref (hover+inview). */
function usePrefetchTracker(anchor: React.RefObject<HTMLAnchorElement>) {
  useEffect(() => {
    const el = anchor.current;
    if (!el) return;
    let stop: (() => void) | undefined;

    import('@/lib/perf/prefetch-ai')
      .then((m) => {
        stop = m.trackLink?.(el);
      })
      .catch(() => {});

    return () => {
      try { stop?.(); } catch {}
    };
  }, [anchor]);
}

// ────────────────────────────────────────────────────────────
export default function UXCursorLab() {
  const rnn = useDynamicRNN();

  // Seed seq with stable randoms (one-time)
  const [seq, setSeq] = useState<Seq>(() => {
    // 64×6 (don, mom, rsi, senti, growth, ΔCPI)
    return Array.from({ length: 64 }, (_, i) => {
      const don = Math.random() > 0.8 ? 1 : 0;
      const momentum = (Math.random() - 0.3) * 0.3;
      const rsi = 45 + Math.random() * 20;
      const sentiment = (Math.random() * 2 - 1);
      const growth = Math.random() * 0.2;
      const dCPI = (Math.random() - 0.5) * 0.1;
      return [don, momentum, rsi, sentiment, growth, dCPI] as Sample;
    });
  });

  // Debounce seq to limit heavy rnn.score() calls
  const debouncedSeq = useDebounced(seq, 100);
  const roi = useMemo(() => rnn.score(debouncedSeq), [rnn, debouncedSeq]);

  // Houdini worklet (optional background paint)
  useHoudiniWorklet('/worklets/gradient.js');

  // Tooltip: rAF-throttled for smooth move
  const onMove = useCallback((x: number, y: number) => {
    showTooltip(`ROI estimé ${(roi * 100).toFixed(1)}%`, x, y);
  }, [roi]);
  const onCardHover = useRafMouse<HTMLDivElement>(onMove);
  const onCardLeave = useCallback(() => hideTooltip(), []);

  // Anchor prefetch tracker
  const linkRef = useRef<HTMLAnchorElement>(null);
  usePrefetchTracker(linkRef);

  // Sequence mutation helpers
  const injectBreakout = useCallback(() => {
    setSeq((s) =>
      s.map((v, i) => (i > 48 ? ([1, v[1] + 0.06, 35, v[3], v[4] + 0.02, v[5] - 0.01] as Sample) : v))
    );
  }, []);
  const riskOff = useCallback(() => {
    setSeq((s) => s.map((v) => ([0, v[1] - 0.05, 60, v[3] * 0.7, v[4], v[5] + 0.02] as Sample)));
  }, []);

  return (
    <div className="p-5 space-y-4 hero-paint">
      {/* Cursor overlays / effects */}
      <CursorSystem />

      <h1 className="text-xl font-semibold">UX Cursor &amp; RNN — Lab</h1>

      <div className="grid-auto">
        {/* RNN Card */}
        <div
          className="ds-card p-3"
          onMouseMove={onCardHover}
          onMouseLeave={onCardLeave}
          role="region"
          aria-label="RNN spatio-temporel ROI"
        >
          <div className="text-sm text-gray-500">RNN spatio-temporel — Score ROI</div>
          <div className="text-2xl font-semibold" aria-live="polite">
            {(roi * 100).toFixed(1)}%
          </div>
          <div className="mt-2 text-xs text-gray-500">Sequence 64×6 (don, mom, rsi, senti, growth, ΔCPI)</div>

          {/* Web Component is defined by side-effect; we render the tag directly */}
          <div className="mt-2">
            <AISparkline />
            <ai-sparkline data={seq.map((r) => r[1]).join(',')} />
          </div>

          <div className="mt-2 flex gap-2">
            <button className="badge" onClick={injectBreakout}>
              Inject breakout
            </button>
            <button className="badge" onClick={riskOff}>
              Mode risk-off
            </button>
          </div>
        </div>

        {/* DnD Watchlist */}
        <div className="ds-card p-3" role="region" aria-label="Watchlist Drag and Drop">
          <div className="text-sm text-gray-500">Watchlist — Drag&amp;Drop</div>
          <WatchlistDnD symbols={['SPY', 'QQQ', 'NVDA', 'AAPL', 'TLT', 'GLD']} />
          <div className="mt-2 text-xs text-gray-500">
            HTML5 DnD, feedback haptique si supporté (<code>navigator.vibrate</code>).
          </div>
        </div>

        {/* Predictive Prefetch */}
        <a
          href="/symbol/SPY"
          className="ds-card p-3"
          ref={linkRef}
          role="link"
          aria-label="Aller à détail symbole SPY (prefetch prédictif)"
        >
          <div className="text-sm text-gray-500">Prefetch prédictif</div>
          <div className="text-lg font-semibold">Aller à /symbol/SPY</div>
          <div className="text-xs text-gray-500">Survol prolongé ⇒ prefetch automatique</div>
        </a>
      </div>
    </div>
  );
}