'use client';
import React, { useEffect, useRef } from 'react';
import { CurvePoint } from '@/lib/types/overview';

interface EquityChartProps {
  data: CurvePoint[];
  title: string;
}

export function EquityChart({ data, title }: EquityChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple chart implementation for testing
    if (chartRef.current) {
      chartRef.current.innerHTML = `
        <div style="padding: 20px; border: 1px solid #ccc; border-radius: 8px; background: #f9f9f9;">
          <h3 style="margin: 0 0 10px 0; color: #333;">${title}</h3>
          <div style="height: 300px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 4px;">
            <div style="text-align: center; color: #666;">
              <div style="font-size: 18px; margin-bottom: 8px;">📈</div>
              <div>Chart loaded with ${data.length} data points</div>
              ${data.length > 0 ? `<div style="font-size: 12px; margin-top: 4px;">Latest: ${data[data.length - 1]?.value || 'N/A'}</div>` : ''}
            </div>
          </div>
        </div>
      `;
    }
  }, [data, title]);

  return <div ref={chartRef} data-testid="equity-chart-core" />;
}
