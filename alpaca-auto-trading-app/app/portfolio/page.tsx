"use client";
import React, { useEffect } from 'react';
import { usePortfolioStore } from '@/store/portfolio';
import { DataTable } from '@/components/DataTable';
import { ChartWrapper } from '@/components/ChartWrapper';
import { createColumnHelper } from '@tanstack/react-table';
import type { Position } from '@/lib/validation';

const columnHelper = createColumnHelper<Position>();

const columns = [
  columnHelper.accessor('symbol', {
    header: 'Symbole',
    cell: info => (
      <span className="font-mono font-semibold">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('qty', {
    header: 'Quantité',
    cell: info => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('avgPrice', {
    header: 'Prix Moyen',
    cell: info => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('marketPrice', {
    header: 'Prix Marché',
    cell: info => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor('pnl', {
    header: 'P&L',
    cell: info => {
      const value = info.getValue();
      const isPositive = value >= 0;
      return (
        <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}${value.toFixed(2)}
        </span>
      );
    },
  }),
  columnHelper.accessor('pnlPct', {
    header: 'P&L %',
    cell: info => {
      const value = info.getValue();
      const isPositive = value >= 0;
      return (
        <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{value.toFixed(2)}%
        </span>
      );
    },
  }),
];

export default function PortfolioPage() {
  const { 
    positions, 
    summary, 
    isLoading, 
    error, 
    setPositions, 
    setSummary, 
    setLoading, 
    setError 
  } = usePortfolioStore();

  // Mock data for demo
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockPositions: Position[] = [
        {
          id: '1',
          symbol: 'AAPL',
          qty: 100,
          avgPrice: 150.00,
          marketPrice: 175.50,
          pnl: 2550.00,
          pnlPct: 17.00,
          sector: 'Technology',
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          symbol: 'TSLA',
          qty: 50,
          avgPrice: 200.00,
          marketPrice: 180.25,
          pnl: -987.50,
          pnlPct: -9.88,
          sector: 'Automotive',
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          symbol: 'MSFT',
          qty: 75,
          avgPrice: 300.00,
          marketPrice: 325.80,
          pnl: 1935.00,
          pnlPct: 8.60,
          sector: 'Technology',
          updatedAt: new Date().toISOString(),
        },
      ];

      const mockSummary = {
        equity: 125000.00,
        cash: 15000.00,
        dayPnl: 1250.00,
        dayPnlPct: 1.01,
        allTimePnl: 3497.50,
      };

      setPositions(mockPositions);
      setSummary(mockSummary);
      setLoading(false);
    }, 1000);
  }, [setPositions, setSummary, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Erreur</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Mock chart data
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    time: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: 120000 + Math.sin(i * 0.2) * 5000 + Math.random() * 2000,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio</h1>
          <p className="text-gray-600">Vue d'ensemble de vos positions et performance</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Équité Totale</h3>
              <p className="text-2xl font-bold text-gray-900">${summary.equity.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Cash</h3>
              <p className="text-2xl font-bold text-gray-900">${summary.cash.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">P&L Jour</h3>
              <p className={`text-2xl font-bold ${summary.dayPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.dayPnl >= 0 ? '+' : ''}${summary.dayPnl.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">P&L Total</h3>
              <p className={`text-2xl font-bold ${summary.allTimePnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.allTimePnl >= 0 ? '+' : ''}${summary.allTimePnl.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <ChartWrapper data={chartData} symbol="Portfolio Equity" height={400} />
        </div>

        {/* Positions Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Positions</h2>
          <DataTable data={positions} columns={columns} />
        </div>
      </div>
    </div>
  );
}
