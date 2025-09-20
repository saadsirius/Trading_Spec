/**
 * File: app/trading/components/PositionsTable.tsx
 * Purpose: Positions table with real-time P&L updates and position management
 * Key dependencies: React, TailwindCSS, zustand
 * Learning Angle: This demonstrates how to display and manage trading positions with
 * real-time updates, proper formatting of financial data, and risk visualization.
 * Notice how we handle different position types and provide clear action buttons.
 */

'use client';

import { useState, useCallback } from 'react';
import { useTradingStore } from '@/state/tradingStore';
import { useNotificationStore } from '@/state/notificationStore';

interface PositionsTableProps {
  positions: any[];
  onPositionUpdate: () => void;
}

interface Position {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  avg_entry_price: string;
  qty: string;
  side: 'long' | 'short';
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
}

export default function PositionsTable({ positions, onPositionUpdate }: PositionsTableProps) {
  const [isClosing, setIsClosing] = useState<string | null>(null);
  const { mode } = useTradingStore();
  const { addNotification } = useNotificationStore();

  const handleClosePosition = useCallback(async (position: Position) => {
    if (isClosing) return;

    const confirmed = window.confirm(
      `Are you sure you want to close your ${position.side} position in ${position.symbol}?\n\n` +
      `Quantity: ${position.qty}\n` +
      `Current P&L: $${parseFloat(position.unrealized_pl).toFixed(2)}\n\n` +
      `${mode === 'live' ? '⚠️ This will execute a real trade with real money!' : 'This is a paper trade.'}`
    );

    if (!confirmed) return;

    setIsClosing(position.symbol);

    try {
      // Create a market order to close the position
      const side = position.side === 'long' ? 'sell' : 'buy';
      const clientOrderId = `close-${position.symbol}-${Date.now()}`;

      const orderPayload = {
        symbol: position.symbol,
        qty: position.qty,
        side: side,
        type: 'market',
        time_in_force: 'day',
        client_order_id: clientOrderId,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to close position');
      }

      addNotification({
        type: 'success',
        title: 'Position Closed',
        message: `Successfully closed ${position.side} position in ${position.symbol}`,
        symbol: position.symbol,
      });

      // Refresh positions
      onPositionUpdate();

    } catch (error: any) {
      console.error('Failed to close position:', error);
      
      addNotification({
        type: 'critical',
        title: 'Position Close Failed',
        message: error.message || 'Failed to close position',
        symbol: position.symbol,
        persistent: true,
      });
    } finally {
      setIsClosing(null);
    }
  }, [isClosing, mode, addNotification, onPositionUpdate]);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPercentage = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num >= 0 ? '+' : ''}${(num * 100).toFixed(2)}%`;
  };

  const getPnLColor = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num > 0) return 'text-emerald-400';
    if (num < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getSideColor = (side: string) => {
    return side === 'long' ? 'text-emerald-400' : 'text-red-400';
  };

  const getSideIcon = (side: string) => {
    return side === 'long' ? '↗️' : '↘️';
  };

  if (positions.length === 0) {
    return (
      <div className="ds-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Positions</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">No open positions</div>
          <div className="text-gray-500 text-sm">Your positions will appear here when you place trades</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Positions</h3>
        <div className="text-sm text-gray-400">
          {positions.length} position{positions.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 text-gray-400 font-medium">Symbol</th>
              <th className="text-left py-2 text-gray-400 font-medium">Side</th>
              <th className="text-right py-2 text-gray-400 font-medium">Qty</th>
              <th className="text-right py-2 text-gray-400 font-medium">Avg Price</th>
              <th className="text-right py-2 text-gray-400 font-medium">Current</th>
              <th className="text-right py-2 text-gray-400 font-medium">Market Value</th>
              <th className="text-right py-2 text-gray-400 font-medium">P&L</th>
              <th className="text-right py-2 text-gray-400 font-medium">P&L %</th>
              <th className="text-center py-2 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position: Position) => (
              <tr key={position.asset_id} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="py-3">
                  <div className="font-semibold text-white">{position.symbol}</div>
                  <div className="text-xs text-gray-500">{position.exchange}</div>
                </td>
                <td className="py-3">
                  <div className={`flex items-center space-x-1 ${getSideColor(position.side)}`}>
                    <span>{getSideIcon(position.side)}</span>
                    <span className="font-medium capitalize">{position.side}</span>
                  </div>
                </td>
                <td className="py-3 text-right font-mono text-white">
                  {parseInt(position.qty).toLocaleString()}
                </td>
                <td className="py-3 text-right font-mono text-white">
                  {formatCurrency(position.avg_entry_price)}
                </td>
                <td className="py-3 text-right font-mono text-white">
                  {formatCurrency(position.current_price)}
                </td>
                <td className="py-3 text-right font-mono text-white">
                  {formatCurrency(position.market_value)}
                </td>
                <td className="py-3 text-right">
                  <div className={`font-mono ${getPnLColor(position.unrealized_pl)}`}>
                    {formatCurrency(position.unrealized_pl)}
                  </div>
                  {parseFloat(position.unrealized_intraday_pl) !== 0 && (
                    <div className={`text-xs font-mono ${getPnLColor(position.unrealized_intraday_pl)}`}>
                      {formatCurrency(position.unrealized_intraday_pl)} today
                    </div>
                  )}
                </td>
                <td className="py-3 text-right">
                  <div className={`font-mono ${getPnLColor(position.unrealized_plpc)}`}>
                    {formatPercentage(position.unrealized_plpc)}
                  </div>
                  {parseFloat(position.unrealized_intraday_plpc) !== 0 && (
                    <div className={`text-xs font-mono ${getPnLColor(position.unrealized_intraday_plpc)}`}>
                      {formatPercentage(position.unrealized_intraday_plpc)} today
                    </div>
                  )}
                </td>
                <td className="py-3 text-center">
                  <button
                    onClick={() => handleClosePosition(position)}
                    disabled={isClosing === position.symbol}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    {isClosing === position.symbol ? 'Closing...' : 'Close'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-400">Total Market Value</div>
            <div className="font-semibold text-white">
              {formatCurrency(
                positions.reduce((sum, pos) => sum + parseFloat(pos.market_value), 0)
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Total P&L</div>
            <div className={`font-semibold ${getPnLColor(
              positions.reduce((sum, pos) => sum + parseFloat(pos.unrealized_pl), 0)
            )}`}>
              {formatCurrency(
                positions.reduce((sum, pos) => sum + parseFloat(pos.unrealized_pl), 0)
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Total P&L %</div>
            <div className={`font-semibold ${getPnLColor(
              positions.reduce((sum, pos) => sum + parseFloat(pos.unrealized_plpc), 0) / positions.length
            )}`}>
              {formatPercentage(
                positions.reduce((sum, pos) => sum + parseFloat(pos.unrealized_plpc), 0) / positions.length
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
