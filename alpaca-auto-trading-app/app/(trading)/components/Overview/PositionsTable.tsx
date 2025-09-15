"use client";

import { motion } from 'framer-motion';
import { PositionRow } from '@/lib/types/overview';
import { formatCurrency, formatPercent, calculatePnLColor } from '@/lib/overview';

interface PositionsTableProps {
  positions: PositionRow[];
  mode: 'paper' | 'live';
}

export function PositionsTable({ positions, mode }: PositionsTableProps) {
  if (!positions.length) {
    return (
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Positions</h3>
          <span className="text-sm text-white/60">0 positions</span>
        </div>
        
        <div className="h-48 flex items-center justify-center text-white/60">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No open positions</p>
            <p className="text-sm mt-1">
              Start trading to see your positions here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Positions</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-white/60">{positions.length} positions</span>
          <button className="text-sm text-secondary hover:text-secondary/80 transition-colors">
            View all →
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-white/60 py-3 font-medium">Symbol</th>
              <th className="text-right text-white/60 py-3 font-medium">Qty</th>
              <th className="text-right text-white/60 py-3 font-medium">Avg</th>
              <th className="text-right text-white/60 py-3 font-medium">Last</th>
              <th className="text-right text-white/60 py-3 font-medium">P&L</th>
              <th className="text-right text-white/60 py-3 font-medium">P&L %</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position, index) => (
              <motion.tr
                key={position.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-3">
                  <div>
                    <div className="font-medium text-white">{position.symbol}</div>
                    <div className="text-sm text-white/60">{position.name}</div>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <span className="text-white font-medium">
                    {position.qty.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-white font-medium">
                    {formatCurrency(position.avg)}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-white font-medium">
                    {formatCurrency(position.last)}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className={`font-medium ${calculatePnLColor(position.unrealized)}`}>
                    {formatCurrency(position.unrealized)}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className={`font-medium ${calculatePnLColor(position.unrealizedPct)}`}>
                    {formatPercent(position.unrealizedPct)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
