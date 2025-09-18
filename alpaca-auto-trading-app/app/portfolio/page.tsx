'use client';

import { useQuery } from '@tanstack/react-query';
import { createChart, ColorType } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

interface Position {
  id: string;
  symbol: string;
  qty: number;
  avgPrice: number;
  marketPrice: number;
  pnl: number;
  pnlPct: number;
  sector?: string;
  updatedAt: string;
}

interface DailyPnl {
  date: string;
  equity: number;
  realized: number;
  unrealized: number;
}

export default function Portfolio() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<any>(null);

  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: async (): Promise<Position[]> => {
      const res = await fetch('/api/positions');
      if (!res.ok) throw new Error('Failed to fetch positions');
      return res.json();
    }
  });

  const { data: pnl, isLoading: pnlLoading } = useQuery({
    queryKey: ['pnl'],
    queryFn: async (): Promise<DailyPnl[]> => {
      const res = await fetch('/api/pnl/daily');
      if (!res.ok) throw new Error('Failed to fetch PnL');
      return res.json();
    }
  });

  const { data: account } = useQuery({
    queryKey: ['account'],
    queryFn: async () => {
      const res = await fetch('/api/account');
      if (!res.ok) throw new Error('Failed to fetch account');
      return res.json();
    }
  });

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || chart) return;

    const newChart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1a1a1a' },
        textColor: '#d1d4dc',
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
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
      },
    });

    setChart(newChart);

    return () => {
      newChart.remove();
    };
  }, [chart]);

  // Update chart data
  useEffect(() => {
    if (!chart || !pnl) return;

    const lineSeries = chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
    });

    const chartData = pnl.map(d => ({
      time: d.date,
      value: d.equity,
    }));

    lineSeries.setData(chartData);

    return () => {
      chart.removeSeries(lineSeries);
    };
  }, [chart, pnl]);

  const totalValue = positions?.reduce((sum, pos) => sum + (pos.marketPrice * pos.qty), 0) || 0;
  const totalPnL = positions?.reduce((sum, pos) => sum + pos.pnl, 0) || 0;
  const totalPnLPct = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <div className="text-sm text-gray-400">
          {account?.status === 'ACTIVE' ? '🟢 Paper Trading' : '🔴 Inactive'}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Total Value</div>
          <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Unrealized P&L</div>
          <div className={clsx(
            "text-2xl font-bold",
            totalPnL >= 0 ? "text-green-400" : "text-red-400"
          )}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400">P&L %</div>
          <div className={clsx(
            "text-2xl font-bold",
            totalPnLPct >= 0 ? "text-green-400" : "text-red-400"
          )}>
            {totalPnLPct >= 0 ? '+' : ''}{totalPnLPct.toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Cash</div>
          <div className="text-2xl font-bold">${account?.cash ? parseFloat(account.cash).toLocaleString() : '0'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Positions */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Positions</h2>
          {positionsLoading ? (
            <div className="text-gray-400">Loading positions...</div>
          ) : positions && positions.length > 0 ? (
            <div className="space-y-3">
              {positions.map((pos) => (
                <div key={pos.symbol} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <div>
                    <div className="font-semibold">{pos.symbol}</div>
                    <div className="text-sm text-gray-400">
                      {pos.qty} @ ${pos.avgPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${(pos.marketPrice * pos.qty).toLocaleString()}</div>
                    <div className={clsx(
                      "text-sm",
                      pos.pnl >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)} ({pos.pnlPct.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400">No positions</div>
          )}
        </div>

        {/* PnL Chart */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Equity Curve</h2>
          {pnlLoading ? (
            <div className="text-gray-400">Loading chart...</div>
          ) : (
            <div ref={chartContainerRef} className="w-full h-80" />
          )}
        </div>
      </div>
    </div>
  );
}