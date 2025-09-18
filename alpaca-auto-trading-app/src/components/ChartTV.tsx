'use client';
import { useEffect, useRef } from 'react';
import { createChart, ISeriesApi } from 'lightweight-charts';

interface ChartTVProps {
  symbol: string;
  timeframe?: string;
}

export default function ChartTV({ symbol, timeframe = '1Day' }: ChartTVProps) {
  const ref = useRef<HTMLDivElement>(null);
  const priceRef = useRef<ISeriesApi<'Candlestick'>>();

  useEffect(() => {
    if (!ref.current) return;
    
    const chart = createChart(ref.current, { 
      height: 400, 
      timeScale: { rightBarStaysOnScroll: true },
      layout: {
        background: { color: 'transparent' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
    });
    
    const series = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });
    
    priceRef.current = series;

    const onResize = () => chart.applyOptions({});
    window.addEventListener('resize', onResize);
    
    return () => { 
      window.removeEventListener('resize', onResize); 
      chart.remove(); 
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!symbol || !priceRef.current) return;
      
      try {
        const url = `/api/alpaca/market/bars?symbols=${encodeURIComponent(symbol)}&timeframe=${timeframe}&limit=500`;
        const res = await fetch(url);
        const json = await res.json();
        const bars = json?.bars?.[symbol] ?? [];
        
        const data = bars.map((b: any) => ({ 
          time: Math.floor(new Date(b.t).getTime()/1000), 
          open: b.o, 
          high: b.h, 
          low: b.l, 
          close: b.c 
        }));
        
        priceRef.current!.setData(data);
      } catch (error) {
        console.error('Failed to load chart data:', error);
      }
    }

    loadData();
  }, [symbol, timeframe]);

  return <div className="w-full h-full" ref={ref} />;
}
