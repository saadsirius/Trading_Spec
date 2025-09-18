"use client";
import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import type { Transaction, HistoryFilter } from '@/lib/validation';

const columnHelper = createColumnHelper<Transaction>();

const columns = [
  columnHelper.accessor('ts', {
    header: 'Date',
    cell: info => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor('symbol', {
    header: 'Symbole',
    cell: info => (
      <span className="font-mono font-semibold">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('side', {
    header: 'Type',
    cell: info => {
      const side = info.getValue();
      const colors = {
        buy: 'text-green-600 bg-green-100',
        sell: 'text-red-600 bg-red-100',
        dividend: 'text-blue-600 bg-blue-100',
        fee: 'text-gray-600 bg-gray-100',
        interest: 'text-purple-600 bg-purple-100',
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[side]}`}>
          {side.toUpperCase()}
        </span>
      );
    },
  }),
  columnHelper.accessor('qty', {
    header: 'Quantité',
    cell: info => {
      const qty = info.getValue();
      return qty ? qty.toLocaleString() : '-';
    },
  }),
  columnHelper.accessor('price', {
    header: 'Prix',
    cell: info => {
      const price = info.getValue();
      return price ? `$${price.toFixed(2)}` : '-';
    },
  }),
  columnHelper.accessor('amount', {
    header: 'Montant',
    cell: info => {
      const amount = info.getValue();
      if (!amount) return '-';
      const isPositive = amount >= 0;
      return (
        <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}${amount.toFixed(2)}
        </span>
      );
    },
  }),
];

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<HistoryFilter>({});

  // Mock data for demo
  useEffect(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          symbol: 'AAPL',
          side: 'buy',
          qty: 100,
          price: 150.00,
          amount: -15000.00,
          ts: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ref: 'order_123',
        },
        {
          id: '2',
          symbol: 'TSLA',
          side: 'buy',
          qty: 50,
          price: 200.00,
          amount: -10000.00,
          ts: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          ref: 'order_124',
        },
        {
          id: '3',
          symbol: 'AAPL',
          side: 'dividend',
          amount: 75.00,
          ts: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          ref: 'div_001',
        },
        {
          id: '4',
          symbol: 'MSFT',
          side: 'buy',
          qty: 75,
          price: 300.00,
          amount: -22500.00,
          ts: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          ref: 'order_125',
        },
        {
          id: '5',
          symbol: 'TSLA',
          side: 'fee',
          amount: -1.00,
          ts: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          ref: 'fee_001',
        },
      ];

      setTransactions(mockTransactions);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Historique des Transactions</h1>
          <p className="text-gray-600">Toutes vos transactions et mouvements de compte</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Symbole</label>
              <input
                type="text"
                placeholder="AAPL, TSLA..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.symbol || ''}
                onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.side || ''}
                onChange={(e) => setFilters({ ...filters, side: e.target.value as any })}
              >
                <option value="">Tous</option>
                <option value="buy">Achat</option>
                <option value="sell">Vente</option>
                <option value="dividend">Dividende</option>
                <option value="fee">Frais</option>
                <option value="interest">Intérêt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.from || ''}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Transactions</h2>
          <DataTable data={transactions} columns={columns} />
        </div>
      </div>
    </div>
  );
}
