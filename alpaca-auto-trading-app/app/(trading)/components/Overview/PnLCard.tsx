"use client";

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercent, calculatePnLColor } from '@/lib/overview';

interface PnLCardProps {
  dayPnL: number;
}

export function PnLCard({ dayPnL }: PnLCardProps) {
  const isPositive = dayPnL >= 0;
  const pnlColor = calculatePnLColor(dayPnL);
  
  // Mock data for the last 7 days
  const weeklyData = [
    { day: 'Mon', pnl: 125.50 },
    { day: 'Tue', pnl: -45.20 },
    { day: 'Wed', pnl: 78.30 },
    { day: 'Thu', pnl: 210.75 },
    { day: 'Fri', pnl: -12.40 },
    { day: 'Sat', pnl: 0 },
    { day: 'Sun', pnl: dayPnL },
  ];

  const maxPnL = Math.max(...weeklyData.map(d => Math.abs(d.pnl)));
  const minPnL = Math.min(...weeklyData.map(d => d.pnl));

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Daily P&L</h3>
        <div className={`flex items-center space-x-2 ${pnlColor}`}>
          {isPositive ? (
            <TrendingUp className="w-5 h-5" />
          ) : (
            <TrendingDown className="w-5 h-5" />
          )}
          <span className="text-2xl font-bold">
            {formatCurrency(dayPnL)}
          </span>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="mb-4">
        <div className="flex items-end justify-between h-24 space-x-1">
          {weeklyData.map((day, index) => {
            const height = maxPnL > 0 ? (Math.abs(day.pnl) / maxPnL) * 100 : 0;
            const isPositiveBar = day.pnl >= 0;
            
            return (
              <div key={day.day} className="flex flex-col items-center flex-1">
                <div className="text-xs text-white/60 mb-1">{day.day}</div>
                <div 
                  className={`w-full rounded-t transition-all duration-300 ${
                    isPositiveBar ? 'bg-support' : 'bg-danger-400'
                  }`}
                  style={{ 
                    height: `${Math.max(height, 2)}%`,
                    opacity: day.pnl === 0 ? 0.3 : 1 
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-sm text-white/60">Best Day</div>
          <div className="text-lg font-semibold text-support">
            {formatCurrency(maxPnL)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-white/60">Worst Day</div>
          <div className="text-lg font-semibold text-danger-400">
            {formatCurrency(minPnL)}
          </div>
        </div>
      </div>
    </div>
  );
}
