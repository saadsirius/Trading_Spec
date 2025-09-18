'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { chartInteractionRateLimit, timeframeChangeRateLimit, getRateLimitKey } from '@/lib/rateLimit';
import { trackChartInteraction } from '@/lib/analytics/Analytics';
import type { Bar } from '@/types';

interface ChartPanelProps {
  symbol: string;
  timeframe?: string;
  height?: number;
  className?: string;
}

export function ChartPanel({ 
  symbol, 
  timeframe = '1Day', 
  height = 400, 
  className = '' 
}: ChartPanelProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch bars data
  const fetchBars = useCallback(async (symbol: string, timeframe: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        symbols: symbol,
        timeframe,
        limit: '100',
        feed: 'iex',
      });

      const response = await fetch(`/api/alpaca/market/bars?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bars data');
      }

      const data = await response.json();
      const symbolBars = data[symbol] || [];
      
      // Transform to lightweight-charts format
      const transformedBars = symbolBars.map((bar: any) => ({
        time: Math.floor(new Date(bar.t).getTime() / 1000),
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
      }));

      setBars(transformedBars);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error fetching bars:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1e1e1e' },
        textColor: '#d1d4dc',
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#485c7b',
      },
      timeScale: {
        borderColor: '#485c7b',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle crosshair movement with rate limiting
    chart.subscribeCrosshairMove((param) => {
      const rateLimitKey = getRateLimitKey('chart', 'crosshair');
      if (chartInteractionRateLimit.isAllowed(rateLimitKey)) {
        trackChartInteraction('crosshair');
      }
    });

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [height]);

  // Update series data
  useEffect(() => {
    if (seriesRef.current && bars.length > 0) {
      seriesRef.current.setData(bars);
    }
  }, [bars]);

  // Fetch data when symbol or timeframe changes
  useEffect(() => {
    const rateLimitKey = getRateLimitKey('chart', 'timeframe');
    if (timeframeChangeRateLimit.isAllowed(rateLimitKey)) {
      trackChartInteraction('timeframe_change');
      fetchBars(symbol, timeframe);
    }
  }, [symbol, timeframe, fetchBars]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-white">Loading chart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-2 left-2 z-10 bg-gray-800 px-2 py-1 rounded text-white text-sm">
        {symbol} - {timeframe}
      </div>
      <div ref={chartContainerRef} className="w-full" style={{ height }} />
    </div>
  );
}
