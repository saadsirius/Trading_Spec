"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { WatchItem } from '@/lib/types/overview';
import { formatCurrency, formatPercent, calculatePnLColor } from '@/lib/overview';

interface WatchlistProps {
  items: WatchItem[];
  mode: 'paper' | 'live';
}

export function Watchlist({ items, mode }: WatchlistProps) {
  const [newSymbol, setNewSymbol] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSymbol = async () => {
    if (!newSymbol.trim()) return;
    
    setIsAdding(true);
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          symbol: newSymbol.trim().toUpperCase(),
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setNewSymbol('');
        // In a real app, you'd refresh the watchlist data here
      }
    } catch (error) {
      console.error('Error adding symbol:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveSymbol = async (symbol: string) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          symbol,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        // In a real app, you'd refresh the watchlist data here
      }
    } catch (error) {
      console.error('Error removing symbol:', error);
    }
  };

  const MiniSparkline = ({ data }: { data: number[] }) => {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    if (range === 0) return <div className="w-16 h-6 bg-white/10 rounded"></div>;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    const isPositive = data[data.length - 1] > data[0];
    const color = isPositive ? '#10B981' : '#EF4444';

    return (
      <svg width="64" height="24" viewBox="0 0 64 24" className="flex-shrink-0">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Watchlist</h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Add symbol..."
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
              className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/60"
            />
            <button
              onClick={handleAddSymbol}
              disabled={isAdding || !newSymbol.trim()}
              className="p-1 bg-secondary/20 text-secondary hover:bg-secondary/30 rounded transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {!items.length ? (
        <div className="h-48 flex items-center justify-center text-white/60">
          <div className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <p>No symbols in watchlist</p>
            <p className="text-sm mt-1">
              Add symbols to track their performance
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div
              key={item.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white truncate">{item.symbol}</div>
                  <div className="text-sm text-white/60 truncate">{item.name}</div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-medium">
                    {formatCurrency(item.last)}
                  </div>
                  <div className={`text-sm ${calculatePnLColor(item.changePct)}`}>
                    {formatPercent(item.changePct)}
                  </div>
                </div>

                <MiniSparkline data={item.spark} />
              </div>

              <button
                onClick={() => handleRemoveSymbol(item.symbol)}
                className="p-1 text-white/40 hover:text-danger-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
