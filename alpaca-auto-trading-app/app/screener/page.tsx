'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import clsx from 'clsx';

interface FactorData {
  symbol: string;
  momentum: number;
  value: number;
  quality: number;
  risk: number;
  growth: number;
  asOf: string;
}

export default function Screener() {
  const [sortBy, setSortBy] = useState<keyof FactorData>('momentum');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState({
    symbol: '',
    minMomentum: '',
    minValue: '',
    minQuality: '',
    maxRisk: '',
    minGrowth: ''
  });

  const { data: factors, isLoading } = useQuery({
    queryKey: ['factors', filter],
    queryFn: async (): Promise<FactorData[]> => {
      const params = new URLSearchParams();
      if (filter.symbol) params.append('symbol', filter.symbol);
      if (filter.minMomentum) params.append('minMomentum', filter.minMomentum);
      if (filter.minValue) params.append('minValue', filter.minValue);
      if (filter.minQuality) params.append('minQuality', filter.minQuality);
      if (filter.maxRisk) params.append('maxRisk', filter.maxRisk);
      if (filter.minGrowth) params.append('minGrowth', filter.minGrowth);
      
      const res = await fetch(`/api/factors?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch factors');
      return res.json();
    }
  });

  const sortedFactors = factors?.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const handleSort = (column: keyof FactorData) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-900';
    if (score >= 60) return 'bg-yellow-900';
    if (score >= 40) return 'bg-orange-900';
    return 'bg-red-900';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Factor Screener</h1>
        <div className="text-sm text-gray-400">
          {factors?.length || 0} symbols analyzed
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
            <label className="block text-sm text-gray-400 mb-1">Min Momentum</label>
            <input
              type="number"
              placeholder="0-100"
              min="0"
              max="100"
              value={filter.minMomentum}
              onChange={(e) => setFilter(prev => ({ ...prev, minMomentum: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Min Value</label>
            <input
              type="number"
              placeholder="0-100"
              min="0"
              max="100"
              value={filter.minValue}
              onChange={(e) => setFilter(prev => ({ ...prev, minValue: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Min Quality</label>
            <input
              type="number"
              placeholder="0-100"
              min="0"
              max="100"
              value={filter.minQuality}
              onChange={(e) => setFilter(prev => ({ ...prev, minQuality: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Max Risk</label>
            <input
              type="number"
              placeholder="0-100"
              min="0"
              max="100"
              value={filter.maxRisk}
              onChange={(e) => setFilter(prev => ({ ...prev, maxRisk: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Min Growth</label>
            <input
              type="number"
              placeholder="0-100"
              min="0"
              max="100"
              value={filter.minGrowth}
              onChange={(e) => setFilter(prev => ({ ...prev, minGrowth: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Factors Table */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Factor Analysis</h2>
        {isLoading ? (
          <div className="text-gray-400">Loading factors...</div>
        ) : sortedFactors && sortedFactors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th 
                    className="text-left py-3 px-4 cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('symbol')}
                  >
                    Symbol {sortBy === 'symbol' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('momentum')}
                  >
                    Momentum {sortBy === 'momentum' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('value')}
                  >
                    Value {sortBy === 'value' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('quality')}
                  >
                    Quality {sortBy === 'quality' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('risk')}
                  >
                    Risk {sortBy === 'risk' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-4 cursor-pointer hover:bg-gray-700"
                    onClick={() => handleSort('growth')}
                  >
                    Growth {sortBy === 'growth' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-4">Updated</th>
                </tr>
              </thead>
              <tbody>
                {sortedFactors.map((factor) => (
                  <tr key={factor.symbol} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-4 font-semibold">{factor.symbol}</td>
                    <td className="py-3 px-4">
                      <div className={clsx(
                        "px-2 py-1 rounded text-sm font-semibold",
                        getScoreBg(factor.momentum),
                        getScoreColor(factor.momentum)
                      )}>
                        {factor.momentum.toFixed(1)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={clsx(
                        "px-2 py-1 rounded text-sm font-semibold",
                        getScoreBg(factor.value),
                        getScoreColor(factor.value)
                      )}>
                        {factor.value.toFixed(1)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={clsx(
                        "px-2 py-1 rounded text-sm font-semibold",
                        getScoreBg(factor.quality),
                        getScoreColor(factor.quality)
                      )}>
                        {factor.quality.toFixed(1)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={clsx(
                        "px-2 py-1 rounded text-sm font-semibold",
                        getScoreBg(factor.risk),
                        getScoreColor(factor.risk)
                      )}>
                        {factor.risk.toFixed(1)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={clsx(
                        "px-2 py-1 rounded text-sm font-semibold",
                        getScoreBg(factor.growth),
                        getScoreColor(factor.growth)
                      )}>
                        {factor.growth.toFixed(1)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {new Date(factor.asOf).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-400">No factors found</div>
        )}
      </div>
    </div>
  );
}
