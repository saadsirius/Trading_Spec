"use client";
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

interface ChartData {
  time: string;
  value: number;
}

interface ChartWrapperProps {
  data: ChartData[];
  symbol: string;
  height?: number;
  className?: string;
}

export function ChartWrapper({ data, symbol, height = 300, className = '' }: ChartWrapperProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#1a1a1a' : '#ffffff' },
        textColor: isDark ? '#ffffff' : '#333333',
      },
      grid: {
        vertLines: { color: isDark ? '#333333' : '#e1e1e1' },
        horzLines: { color: isDark ? '#333333' : '#e1e1e1' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: isDark ? '#333333' : '#e1e1e1',
      },
      timeScale: {
        borderColor: isDark ? '#333333' : '#e1e1e1',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height,
    });

    // Create series
    const series = chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
    });

    // Set data
    series.setData(data);

    // Store refs
    chartRef.current = chart;
    seriesRef.current = series;

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
  }, [data, height, isDark]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{symbol}</h3>
        <button
          onClick={() => setIsDark(!isDark)}
          className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded"
          data-testid="chart-theme-toggle"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
      <div ref={chartContainerRef} className="w-full" data-testid="chart-container" />
    </div>
  );
}
