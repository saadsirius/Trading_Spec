"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

interface TradingDashboardProps {
  mode: 'paper' | 'live';
}

export default function TradingDashboard({ mode }: TradingDashboardProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('10');

  const handlePlaceOrder = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol,
          side: orderType,
          qty: parseFloat(quantity),
          type: 'market',
          mode: mode,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`Order placed successfully in ${mode} mode!`);
      } else {
        alert(`Order failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass p-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          {mode === 'live' ? 'Live' : 'Paper'} Trading Dashboard
        </h1>
        <p className="text-white/80">
          {mode === 'live' 
            ? 'Trade with real money - proceed with caution!' 
            : 'Practice trading with virtual money'
          }
        </p>
      </div>

      {/* Trading Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="glass p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Place Order</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Symbol
              </label>
              <input
                type="text"
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary/60"
                placeholder="AAPL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Side
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setOrderType('buy')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    orderType === 'buy' 
                      ? 'bg-support/20 text-support' 
                      : 'bg-white/10 text-white/80 hover:bg-white/15'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setOrderType('sell')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    orderType === 'sell' 
                      ? 'bg-danger-500/20 text-danger-400' 
                      : 'bg-white/10 text-white/80 hover:bg-white/15'
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary/60"
                placeholder="10"
              />
            </div>

            <button
              onClick={handlePlaceOrder}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                mode === 'live'
                  ? 'bg-danger-500/20 text-danger-400 hover:bg-danger-500/30'
                  : 'bg-support/20 text-support hover:bg-support/30'
              }`}
            >
              {mode === 'live' ? '🚨 Place Live Order' : '📝 Place Paper Order'}
            </button>
          </div>
        </div>

        {/* Market Data */}
        <div className="glass p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Market Data</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/80">Price:</span>
              <span className="text-white font-medium">$150.25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Change:</span>
              <span className="text-support">+$2.15 (+1.45%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Volume:</span>
              <span className="text-white font-medium">45.2M</span>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="glass p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/80">Mode:</span>
              <span className={`font-medium ${
                mode === 'live' ? 'text-danger-400' : 'text-secondary'
              }`}>
                {mode.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Buying Power:</span>
              <span className="text-white font-medium">$10,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Day P&L:</span>
              <span className="text-support">+$125.50</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="glass p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Price Chart</h2>
        <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
          <p className="text-white/60">Chart component will be integrated here</p>
        </div>
      </div>
    </div>
  );
}
