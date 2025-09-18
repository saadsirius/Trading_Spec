'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import CursorSystem, { showTooltip, hideTooltip } from '@/components/cursor/CursorSystem';
import { WatchlistDnD } from '@/components/dnd/WatchlistDnD';
import { useDynamicRNN } from '@/hooks/useDynamicRNN';
import dynamic from 'next/dynamic';

const AISparkline = dynamic(async () => { 
  if (typeof window !== 'undefined') { 
    await import('@/webc/ai-sparkline'); 
  } 
  return () => null; 
}, { ssr: false });

export default function UXCursorLab() {
  const rnn = useDynamicRNN();
  const [seq, setSeq] = useState<number[][]>(() => Array.from({ length: 64 }, (_, i) => [
    Math.random() > .8 ? 1 : 0, 
    (Math.random() - .3) * .3, 
    45 + Math.random() * 20, 
    (Math.random() * 2 - 1), 
    Math.random() * .2, 
    (Math.random() - .5) * .1
  ]));
  const roi = useMemo(() => rnn.score(seq), [seq]);

  useEffect(() => { // Houdini paint worklet
    if ('paintWorklet' in CSS) { //@ts-ignore
      CSS.paintWorklet.addModule('/worklets/gradient.js').catch(() => {});
    }
  }, []);

  const onCardHover = (e: React.MouseEvent) => showTooltip(`ROI estimé ${(roi * 100).toFixed(1)}%`, e.clientX, e.clientY);

  return (
    <div className="p-5 space-y-4 hero-paint">
      <CursorSystem />
      <h1 className="text-xl font-semibold">UX Cursor & RNN — Lab</h1>

      <div className="grid-auto">
        <div 
          className="ds-card" 
          style={{ padding: 12 }} 
          onMouseMove={onCardHover} 
          onMouseLeave={hideTooltip}
        >
          <div className="text-sm text-gray-500">RNN spatio-temporel — Score ROI</div>
          <div className="text-2xl font-semibold">{(roi * 100).toFixed(1)}%</div>
          <div className="mt-2 text-xs text-gray-500">Sequence 64×6 (don,mom,rsi,senti,growth,ΔCPI)</div>
          <div className="mt-2">
            <ai-sparkline data={seq.map(r => r[1]).join(',')}></ai-sparkline>
          </div>
          <div className="mt-2 flex gap-2">
            <button 
              className="badge" 
              onClick={() => setSeq(s => s.map((v, i) => i > 48 ? [1, v[1] + .06, 35, v[3], v[4] + .02, v[5] - 0.01] : v))}
            >
              Inject breakout
            </button>
            <button 
              className="badge" 
              onClick={() => setSeq(s => s.map(v => [0, v[1] - .05, 60, v[3] * .7, v[4], v[5] + .02]))}
            >
              Mode risk-off
            </button>
          </div>
        </div>

        <div className="ds-card" style={{ padding: 12 }}>
          <div className="text-sm text-gray-500">Watchlist — Drag&Drop</div>
          <WatchlistDnD symbols={['SPY', 'QQQ', 'NVDA', 'AAPL', 'TLT', 'GLD']} />
          <div className="mt-2 text-xs text-gray-500">HTML5 DnD, feedback haptique si supporté (navigator.vibrate).</div>
        </div>

        <a 
          href="/symbol/SPY" 
          className="ds-card" 
          style={{ padding: 12 }} 
          ref={(el) => { 
            if (el) { 
              import('@/lib/perf/prefetch-ai').then(m => m.trackLink(el as any)); 
            }
          }}
        >
          <div className="text-sm text-gray-500">Prefetch prédictif</div>
          <div className="text-lg font-semibold">Aller à /symbol/SPY</div>
          <div className="text-xs text-gray-500">Survol prolongé ⇒ prefetch automatique</div>
        </a>
      </div>
    </div>
  );
}
