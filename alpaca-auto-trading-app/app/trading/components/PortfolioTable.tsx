'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  side: 'long' | 'short';
}

interface PortfolioTableProps {
  positions: Position[];
  onClosePosition: (symbol: string) => void;
}

export const PortfolioTable = ({ positions, onClosePosition }: PortfolioTableProps) => {
  const [sortBy, setSortBy] = useState<keyof Position>('marketValue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedPositions = [...positions].sort((a, b) => {
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

  const handleSort = (column: keyof Position) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const totalValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0);
  const totalPL = positions.reduce((sum, pos) => sum + pos.unrealizedPL, 0);
  const totalPLPercent = totalValue > 0 ? (totalPL / totalValue) * 100 : 0;

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Total Value:</span>
            <span className="font-medium">${totalValue.toFixed(2)}</span>
          </div>
          <div className="flex items-center space-x-1">
            {totalPL >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className="text-gray-600">P&L:</span>
            <span className={`font-medium ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalPL.toFixed(2)} ({totalPLPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <DollarSign className="w-12 h-12 mx-auto" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Positions</h4>
          <p className="text-gray-500">Start trading to see your positions here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('symbol')}
                >
                  Symbol
                </th>
                <th 
                  className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('quantity')}
                >
                  Quantity
                </th>
                <th 
                  className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('avgPrice')}
                >
                  Avg Price
                </th>
                <th 
                  className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('currentPrice')}
                >
                  Current Price
                </th>
                <th 
                  className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('marketValue')}
                >
                  Market Value
                </th>
                <th 
                  className="text-right py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('unrealizedPL')}
                >
                  Unrealized P&L
                </th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPositions.map((position, index) => (
                <motion.tr
                  key={position.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{position.symbol}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        position.side === 'long' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {position.side}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {position.quantity}
                  </td>
                  <td className="py-3 px-4 text-right">
                    ${position.avgPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    ${position.currentPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    ${position.marketValue.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {position.unrealizedPL >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`font-medium ${
                        position.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${position.unrealizedPL.toFixed(2)}
                      </span>
                      <span className={`text-sm ${
                        position.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ({position.unrealizedPLPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onClosePosition(position.symbol)}
                    >
                      Close
                    </Button>
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
