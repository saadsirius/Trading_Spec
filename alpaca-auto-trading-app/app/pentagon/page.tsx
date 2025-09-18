'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface FactorData {
  symbol: string;
  momentum: number;
  value: number;
  quality: number;
  risk: number;
  growth: number;
  asOf: string;
}

export default function Pentagon() {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');

  const { data: symbols } = useQuery({
    queryKey: ['symbols'],
    queryFn: async (): Promise<string[]> => {
      const res = await fetch('/api/factors');
      if (!res.ok) throw new Error('Failed to fetch symbols');
      const factors: FactorData[] = await res.json();
      return [...new Set(factors.map(f => f.symbol))];
    }
  });

  const { data: factorData } = useQuery({
    queryKey: ['factors', selectedSymbol],
    queryFn: async (): Promise<FactorData | null> => {
      const res = await fetch(`/api/factors?symbol=${selectedSymbol}`);
      if (!res.ok) throw new Error('Failed to fetch factor data');
      const factors: FactorData[] = await res.json();
      return factors[0] || null;
    },
    enabled: !!selectedSymbol
  });

  const chartData = factorData ? [
    { factor: 'Momentum', score: factorData.momentum, fullMark: 100 },
    { factor: 'Value', score: factorData.value, fullMark: 100 },
    { factor: 'Quality', score: factorData.quality, fullMark: 100 },
    { factor: 'Risk', score: factorData.risk, fullMark: 100 },
    { factor: 'Growth', score: factorData.growth, fullMark: 100 }
  ] : [];

  const getOverallScore = () => {
    if (!factorData) return 0;
    return (factorData.momentum + factorData.value + factorData.quality + factorData.risk + factorData.growth) / 5;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Poor';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pentagon Analysis</h1>
        <div className="text-sm text-gray-400">
          Investing Warriors Style
        </div>
      </div>

      {/* Symbol Selector */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Select Symbol</h2>
        <div className="flex flex-wrap gap-2">
          {symbols?.map((symbol) => (
            <button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                selectedSymbol === symbol
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      {factorData && (
        <>
          {/* Overall Score */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{selectedSymbol} Analysis</h2>
                <div className="text-sm text-gray-400">
                  Last updated: {new Date(factorData.asOf).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold" style={{ color: getScoreColor(getOverallScore()) }}>
                  {getOverallScore().toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">
                  {getScoreLabel(getOverallScore())}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Factor Radar</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={chartData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis 
                      dataKey="factor" 
                      tick={{ fill: '#d1d5db', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                    />
                    <Radar
                      name={selectedSymbol}
                      dataKey="score"
                      stroke={getScoreColor(getOverallScore())}
                      fill={getScoreColor(getOverallScore())}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f9fafb'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Factor Breakdown */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Factor Breakdown</h2>
              <div className="space-y-4">
                {chartData.map((item) => (
                  <div key={item.factor} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{item.factor}</span>
                        <span 
                          className="text-sm font-semibold"
                          style={{ color: getScoreColor(item.score) }}
                        >
                          {item.score.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${item.score}%`,
                            backgroundColor: getScoreColor(item.score)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Factor Descriptions */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Factor Descriptions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-2">Momentum</h3>
                <p className="text-sm text-gray-300">
                  Price performance over 6M and 12M periods. Higher scores indicate stronger upward price trends.
                </p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-blue-400 mb-2">Value</h3>
                <p className="text-sm text-gray-300">
                  Valuation metrics (P/E, P/B, EV/EBITDA). Lower ratios indicate better value opportunities.
                </p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-purple-400 mb-2">Quality</h3>
                <p className="text-sm text-gray-300">
                  Financial health (ROE, ROIC, margins). Higher scores indicate better business quality.
                </p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-yellow-400 mb-2">Risk</h3>
                <p className="text-sm text-gray-300">
                  Volatility and drawdown metrics. Higher scores indicate lower risk (inverted scale).
                </p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-red-400 mb-2">Growth</h3>
                <p className="text-sm text-gray-300">
                  Revenue and earnings growth rates. Higher scores indicate stronger growth prospects.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {!factorData && selectedSymbol && (
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <div className="text-gray-400">Loading factor data for {selectedSymbol}...</div>
        </div>
      )}
    </div>
  );
}
