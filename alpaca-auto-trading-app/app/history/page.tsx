'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import clsx from 'clsx';

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  price: number;
  ts: string;
  orderId?: string;
}

export default function History() {
  const [filter, setFilter] = useState({
    symbol: '',
    side: '',
    dateFrom: '',
    dateTo: ''
  });

  const { data: trades, isLoading } = useQuery({
    queryKey: ['trades', filter],
    queryFn: async (): Promise<Trade[]> => {
      const params = new URLSearchParams();
      if (filter.symbol) params.append('symbol', filter.symbol);
      if (filter.side) params.append('side', filter.side);
      if (filter.dateFrom) params.append('dateFrom', filter.dateFrom);
      if (filter.dateTo) params.append('dateTo', filter.dateTo);
      
      const res = await fetch(`/api/trades?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch trades');
      return res.json();
    }
  });

  const totalVolume = trades?.reduce((sum, trade) => sum + (trade.qty * trade.price), 0) || 0;
  const buyTrades = trades?.filter(t => t.side === 'buy').length || 0;
  const sellTrades = trades?.filter(t => t.side === 'sell').length || 0;

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Trade History</h1>
        <div className="text-sm text-gray-400">
          {trades?.length || 0} trades • ${totalVolume.toLocaleString()} volume
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Total Volume</div>
          <div className="text-2xl font-bold">${totalVolume.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Buy Orders</div>
          <div className="text-2xl font-bold text-green-400">{buyTrades}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Sell Orders</div>
          <div className="text-2xl font-bold text-red-400">{sellTrades}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Symbol</label>
            <input
              type="text"
              placeholder="e.g., AAPL"
              value={filter.symbol}
              onChange={(e) => setFilter(prev => ({ ...prev, symbol: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Side</label>
            <select
              value={filter.side}
              onChange={(e) => setFilter(prev => ({ ...prev, side: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">From Date</label>
            <input
              type="date"
              value={filter.dateFrom}
              onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">To Date</label>
            <input
              type="date"
              value={filter.dateTo}
              onChange={(e) => setFilter(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Trades</h2>
        {isLoading ? (
          <div className="text-gray-400">Loading trades...</div>
        ) : trades && trades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Symbol</th>
                  <th className="text-left py-3 px-4">Side</th>
                  <th className="text-left py-3 px-4">Quantity</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Value</th>
                  <th className="text-left py-3 px-4">Order ID</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr key={trade.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-4 text-sm">
                      {new Date(trade.ts).toLocaleDateString()} {new Date(trade.ts).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-semibold">{trade.symbol}</td>
                    <td className="py-3 px-4">
                      <span className={clsx(
                        "px-2 py-1 rounded text-xs font-semibold",
                        trade.side === 'buy' 
                          ? "bg-green-900 text-green-300" 
                          : "bg-red-900 text-red-300"
                      )}>
                        {trade.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">{trade.qty}</td>
                    <td className="py-3 px-4">${trade.price.toFixed(2)}</td>
                    <td className="py-3 px-4 font-semibold">
                      ${(trade.qty * trade.price).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {trade.orderId || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-400">No trades found</div>
        )}
      </div>
    </div>
  );
}