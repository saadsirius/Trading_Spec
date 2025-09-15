"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CurvePoint } from '@/lib/types/overview';
import { formatCurrency } from '@/lib/overview';

interface EquityChartProps {
  data: CurvePoint[];
}

export function EquityChart({ data }: EquityChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    if (!data.length) return;

    const loadChart = async () => {
      try {
        // Dynamic import for lightweight-charts
        const { createChart } = await import('lightweight-charts');
        
        if (!chartRef.current) return;

        const chart = createChart(chartRef.current, {
          width: chartRef.current.clientWidth,
          height: 300,
          layout: {
            background: { color: 'transparent' },
            textColor: '#ffffff',
          },
          grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
          },
          crosshair: {
            mode: 1,
          },
          rightPriceScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            textColor: '#ffffff',
          },
          timeScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
        });

        // Convert data to chart format
        const chartData = data.map(point => ({
          time: point.t,
          value: point.v,
        }));

        const areaSeries = chart.addAreaSeries({
          lineColor: '#22D3EE',
          topColor: 'rgba(34, 211, 238, 0.3)',
          bottomColor: 'rgba(34, 211, 238, 0.05)',
          lineWidth: 2,
        });

        areaSeries.setData(chartData);

        // Fit content
        chart.timeScale().fitContent();

        // Handle resize
        const handleResize = () => {
          if (chartRef.current) {
            chart.applyOptions({
              width: chartRef.current.clientWidth,
            });
          }
        };

        window.addEventListener('resize', handleResize);
        setChartLoaded(true);

        return () => {
          window.removeEventListener('resize', handleResize);
          chart.remove();
        };
      } catch (error) {
        console.error('Error loading chart:', error);
      }
    };

    loadChart();
  }, [data]);

  if (!data.length) {
    return (
      <div className="glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Equity Curve</h3>
        <div className="h-64 flex items-center justify-center text-white/60">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p>No equity data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Equity Curve</h3>
        <div className="text-sm text-white/60">
          Last 90 days
        </div>
      </div>
      
      <div className="relative">
        <div 
          ref={chartRef} 
          className="w-full h-64"
          style={{ minHeight: '256px' }}
        />
        
        {!chartLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          </div>
        )}
      </div>

      {/* Chart Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-sm text-white/60">Current</div>
          <div className="text-lg font-semibold text-white">
            {formatCurrency(data[data.length - 1]?.v || 0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-white/60">High</div>
          <div className="text-lg font-semibold text-support">
            {formatCurrency(Math.max(...data.map(d => d.v)))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-white/60">Low</div>
          <div className="text-lg font-semibold text-danger-400">
            {formatCurrency(Math.min(...data.map(d => d.v)))}
          </div>
        </div>
      </div>
    </div>
  );
}
