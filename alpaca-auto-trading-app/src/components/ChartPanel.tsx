'use client';
import { useEffect, useRef } from 'react';
import { createChart, ISeriesApi } from 'lightweight-charts';
import { useUI } from '@/state/uiStore';

export default function ChartPanel({ symbol }: { symbol: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const priceRef = useRef<ISeriesApi<'Candlestick'>>();
  const donHighRef = useRef<ISeriesApi<'Line'>>();
  const donLowRef = useRef<ISeriesApi<'Line'>>();
  const { timeframe, donchian20 } = useUI();

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, { height: 520, timeScale: { rightBarStaysOnScroll: true } });
    const series = chart.addCandlestickSeries();
    priceRef.current = series;
    const high = chart.addLineSeries({ lineWidth: 1 });
    const low  = chart.addLineSeries({ lineWidth: 1 });
    donHighRef.current = high; donLowRef.current = low;

    let lastMove = 0;
    chart.subscribeCrosshairMove(() => { const now = Date.now(); if (now - lastMove < 100) return; lastMove = now; });
    const onResize = () => chart.applyOptions({});
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.remove(); };
  }, []);

  async function load() {
    if (!symbol || !priceRef.current) return;
    const url = `/api/alpaca/market/bars?symbols=${encodeURIComponent(symbol)}&timeframe=${timeframe}&limit=500`;
    const res = await fetch(url);
    const json = await res.json();
    const bars = json?.bars?.[symbol] ?? [];
    const data = bars.map((b: any) => ({ time: Math.floor(new Date(b.t).getTime()/1000), open:b.o, high:b.h, low:b.l, close:b.c }));
    priceRef.current!.setData(data);
    // Donchian 20 (client-side)
    if (donHighRef.current && donLowRef.current) {
      if (!donchian20) { donHighRef.current.setData([]); donLowRef.current.setData([]); return; }
      const highs: number[] = []; const lows: number[] = [];
      const outH: any[] = []; const outL: any[] = [];
      for (let i=0;i<data.length;i++){
        highs.push(data[i].high); lows.push(data[i].low);
        const start = Math.max(0, i-19);
        const h = Math.max(...highs.slice(start, i+1));
        const l = Math.min(...lows.slice(start, i+1));
        outH.push({ time: data[i].time, value: h });
        outL.push({ time: data[i].time, value: l });
      }
      donHighRef.current.setData(outH);
      donLowRef.current.setData(outL);
    }
  }

  useEffect(() => { const t = setTimeout(load, 300); return ()=>clearTimeout(t); }, [symbol, timeframe, donchian20]);

  return <div className="w-full h-full" ref={ref} />;
}