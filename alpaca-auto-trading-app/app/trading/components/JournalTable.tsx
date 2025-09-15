'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: string;
  pnl?: number;
  pnlPercent?: number;
  status: 'filled' | 'pending' | 'cancelled';
  orderType: 'market' | 'limit';
  notes?: string;
}

interface JournalTableProps {
  trades: Trade[];
  onEditTrade: (tradeId: string) => void;
  onDeleteTrade: (tradeId: string) => void;
}

export const JournalTable = ({ trades, onEditTrade, onDeleteTrade }: JournalTableProps) => {
  const [sortBy, setSortBy] = useState<keyof Trade>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const sortedTrades = [...trades]
    .filter(trade => filterStatus === 'all' || trade.status === filterStatus)
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });

  const handleSort = (column: keyof Trade) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const totalTrades = trades.length;
  const filledTrades = trades.filter(t => t.status === 'filled');
  const totalPnL = filledTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const winRate = filledTrades.length > 0 
    ? (filledTrades.filter(t => (t.pnl || 0) > 0).length / filledTrades.length) * 100 
    : 0;

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Trade Journal</h3>
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Trades</option>
            <option value="filled">Filled</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Trades</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{totalTrades}</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-green-900 mt-1">{winRate.toFixed(1)}%</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Total P&L</span>
          </div>
          <div className={`text-2xl font-bold mt-1 ${
            totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            ${totalPnL.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Filled Trades</span>
          </div>
          <div className="text-2xl font-bold text-orange-900 mt-1">{filledTrades.length}</div>
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="w-12 h-12 mx-auto" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Trades Yet</h4>
          <p className="text-gray-500">Your trading history will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('timestamp')}
                >
                  Date
                </th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('symbol')}
                >
                  Symbol
                </th>
                <th 
                  className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('side')}
                >
                  Side
                </th>
                <th 
                  className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('quantity')}
                >
                  Quantity
                </th>
                <th 
                  className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('price')}
                >
                  Price
                </th>
                <th 
                  className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('pnl')}
                >
                  P&L
                </th>
                <th 
                  className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('status')}
                >
                  Status
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTrades.map((trade, index) => (
                <motion.tr
                  key={trade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">
                      {new Date(trade.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{trade.symbol}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      trade.side === 'buy' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {trade.quantity}
                  </td>
                  <td className="py-3 px-4 text-right">
                    ${trade.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {trade.pnl !== undefined ? (
                      <div className="flex items-center justify-end space-x-1">
                        {trade.pnl >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`font-medium ${
                          trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${trade.pnl.toFixed(2)}
                        </span>
                        {trade.pnlPercent && (
                          <span className={`text-sm ${
                            trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ({trade.pnlPercent.toFixed(2)}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      trade.status === 'filled' 
                        ? 'bg-green-100 text-green-800'
                        : trade.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEditTrade(trade.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDeleteTrade(trade.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
