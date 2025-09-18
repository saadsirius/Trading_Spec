'use client';
import { useEffect, useRef } from 'react';
import { useMarket } from '@/state/marketStore';

type Opts = { symbols: string[]; pollFallbackMs?: number };

export function useMarketStream({ symbols, pollFallbackMs=5_000 }: Opts) {
  const setTick = useMarket(s=>s.setTick);
  const wsRef = useRef<WebSocket | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const url = process.env.NEXT_PUBLIC_APCA_STREAM_URL || ''; // ex: wss://stream.data.alpaca.markets/v2/iex
    let tries = 0;
    let timer: any = 0;

    async function connect() {
      if (!url) return startPolling();
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;
        ws.onopen = () => {
          tries = 0;
          const key = process.env.NEXT_PUBLIC_APCA_API_KEY_ID ?? '';
          const secret = process.env.NEXT_PUBLIC_APCA_API_SECRET_KEY ?? '';
          ws.send(JSON.stringify({ action:'auth', key, secret }));
          ws.send(JSON.stringify({ action:'subscribe', trades: symbols.map(s => `T.${s}`) }));
        };
        ws.onmessage = (ev) => {
          const msg = JSON.parse(ev.data);
          // Alpaca renvoie différents types; on cible T.* pour les trades
          if (Array.isArray(msg)) {
            for (const m of msg) {
              if (m.T === 't' && m.S) setTick({ symbol: m.S, p: m.p ?? m.ap ?? m.bp ?? 0, t: Date.parse(m.t ?? new Date().toISOString()) });
            }
          }
        };
        ws.onerror = () => { ws.close(); };
        ws.onclose = () => {
          if (!alive.current) return;
          tries++;
          const backoff = Math.min(10_000, 500 * 2 ** tries);
          clearTimeout(timer);
          timer = setTimeout(connect, backoff);
        };
      } catch {
        startPolling();
      }
    }

    let pollTimer: any = 0;
    async function startPolling() {
      clearInterval(pollTimer);
      const pull = async () => {
        try {
          const u = `/api/alpaca/market/quotes?symbols=${symbols.join(',')}`;
          const r = await fetch(u);
          const j = await r.json();
          const q = j?.quotes ?? {};
          for (const k of Object.keys(q)) {
            const last = q[k]?.last ?? q[k]?.c ?? 0;
            setTick({ symbol: k, p: last, t: Date.now() });
          }
        } catch {/* ignore */}
      };
      pollTimer = setInterval(pull, pollFallbackMs);
      pull();
    }

    connect();
    return () => {
      alive.current = false;
      clearTimeout(timer);
      try { wsRef.current?.close(); } catch {}
    };
  }, [symbols.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
}
