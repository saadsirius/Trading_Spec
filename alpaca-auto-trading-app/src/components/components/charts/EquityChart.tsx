// FILE: components/charts/EquityChart.tsx
// Ensure the root has data-testid inside too (belt-and-suspenders) and an empty state.
// If you already use the advanced EquityChart we prepared, just add data-testid on wrapper.

'use client';
import React, { useEffect, useState } from 'react';
import { CurvePoint } from '@/lib/types/overview';
import { EquityChart as CoreChart } from '@/components/charts/EquityChartCore';

interface EquityChartProps {
  data?: CurvePoint[];
  title: string;
  symbol?: string;
}

export function EquityChart({ data: initialData, title, symbol }: EquityChartProps) {
  const [data, setData] = useState<CurvePoint[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData?.length);

  useEffect(() => {
    if (symbol && !initialData?.length) {
      const fetchData = async () => {
        try {
          const res = await fetch(`/api/ohlc?symbol=${symbol}&timeframe=1D`);
          const { candles } = await res.json();
          
          // Convert candles to CurvePoint format
          const curveData: CurvePoint[] = candles.map((candle: any) => ({
            time: candle.t,
            value: candle.c // use close price
          }));
          
          setData(curveData);
        } catch (error) {
          console.error('Failed to fetch chart data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [symbol, initialData]);

  if (loading) {
    return (
      <div data-testid="equity-chart">
        <div className="glass p-6">
          <div role="status" aria-live="polite" className="animate-pulse h-64" />
        </div>
      </div>
    );
  }

  return (
    <div data-testid="equity-chart">
      <CoreChart data={data} title={title} />
    </div>
  );
}
