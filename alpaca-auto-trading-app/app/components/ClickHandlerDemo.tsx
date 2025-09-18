'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClickHandler, 
  OrderClickHandler, 
  PositionClickHandler, 
  NotificationClickHandler,
  ChartClickHandler,
  NavigationClickHandler 
} from './ClickHandler';
import { useClickHandlers } from '@/lib/hooks/useClickHandlers';

export const ClickHandlerDemo: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [mode, setMode] = useState<'paper' | 'live'>('paper');
  const [lastAction, setLastAction] = useState<string>('');

  const { 
    handleQuickBuy, 
    handleQuickSell, 
    handleNavigationClick,
    isLoading,
    error 
  } = useClickHandlers();

  const handleQuickBuyClick = async () => {
    const success = await handleQuickBuy(selectedSymbol, mode);
    setLastAction(success ? `Quick buy ${selectedSymbol}` : 'Quick buy failed');
  };

  const handleQuickSellClick = async () => {
    const success = await handleQuickSell(selectedSymbol, mode);
    setLastAction(success ? `Quick sell ${selectedSymbol}` : 'Quick sell failed');
  };

  const handleNavigationDemo = async () => {
    await handleNavigationClick({
      route: '/trading',
      params: { symbol: selectedSymbol, mode }
    });
    setLastAction(`Navigated to trading page`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Click Handler Demo</h1>
        <p className="text-white/80">Interactive demonstration of all click functionality</p>
      </div>

      {/* Status Display */}
      <div className="glass p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-white/60">Loading:</p>
            <p className={`font-medium ${isLoading ? 'text-yellow-400' : 'text-green-400'}`}>
              {isLoading ? 'Yes' : 'No'}
            </p>
          </div>
          <div>
            <p className="text-white/60">Error:</p>
            <p className={`font-medium ${error ? 'text-red-400' : 'text-green-400'}`}>
              {error || 'None'}
            </p>
          </div>
          <div>
            <p className="text-white/60">Last Action:</p>
            <p className="font-medium text-white">{lastAction || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="glass p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 mb-2">Symbol</label>
            <input
              type="text"
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-white/80 mb-2">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'paper' | 'live')}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="paper">Paper Trading</option>
              <option value="live">Live Trading</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClickHandler
            onClick={handleQuickBuyClick}
            variant="hover"
            className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-medium">Quick Buy {selectedSymbol}</div>
            </div>
          </ClickHandler>

          <ClickHandler
            onClick={handleQuickSellClick}
            variant="hover"
            className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📉</div>
              <div className="font-medium">Quick Sell {selectedSymbol}</div>
            </div>
          </ClickHandler>
        </div>
      </div>

      {/* Order Handler Examples */}
      <div className="glass p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Order Handlers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OrderClickHandler
            orderData={{
              symbol: selectedSymbol,
              side: 'buy',
              quantity: 10,
              orderType: 'market',
              mode
            }}
            onSuccess={() => setLastAction(`Order placed for ${selectedSymbol}`)}
            className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🛒</div>
              <div className="font-medium">Buy 10 {selectedSymbol}</div>
            </div>
          </OrderClickHandler>

          <OrderClickHandler
            orderData={{
              symbol: selectedSymbol,
              side: 'sell',
              quantity: 5,
              orderType: 'limit',
              limitPrice: 150.00,
              mode
            }}
            onSuccess={() => setLastAction(`Limit order placed for ${selectedSymbol}`)}
            className="p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium">Sell 5 {selectedSymbol} @ $150</div>
            </div>
          </OrderClickHandler>
        </div>
      </div>

      {/* Position Handler Examples */}
      <div className="glass p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Position Handlers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PositionClickHandler
            positionData={{
              symbol: selectedSymbol,
              action: 'close',
              positionId: 'pos_123'
            }}
            onSuccess={() => setLastAction(`Position closed for ${selectedSymbol}`)}
            className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">❌</div>
              <div className="font-medium">Close Position</div>
            </div>
          </PositionClickHandler>

          <PositionClickHandler
            positionData={{
              symbol: selectedSymbol,
              action: 'modify',
              positionId: 'pos_123'
            }}
            onSuccess={() => setLastAction(`Position modification for ${selectedSymbol}`)}
            className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">✏️</div>
              <div className="font-medium">Modify Position</div>
            </div>
          </PositionClickHandler>

          <PositionClickHandler
            positionData={{
              symbol: selectedSymbol,
              action: 'view',
              positionId: 'pos_123'
            }}
            onSuccess={() => setLastAction(`Viewing position details for ${selectedSymbol}`)}
            className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👁️</div>
              <div className="font-medium">View Details</div>
            </div>
          </PositionClickHandler>
        </div>
      </div>

      {/* Notification Handler Examples */}
      <div className="glass p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Notification Handlers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NotificationClickHandler
            notificationData={{
              notificationId: 'notif_123',
              action: 'mark_read'
            }}
            onSuccess={() => setLastAction('Notification marked as read')}
            className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-medium">Mark as Read</div>
            </div>
          </NotificationClickHandler>

          <NotificationClickHandler
            notificationData={{
              notificationId: 'notif_123',
              action: 'dismiss'
            }}
            onSuccess={() => setLastAction('Notification dismissed')}
            className="p-4 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400 hover:bg-gray-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🗑️</div>
              <div className="font-medium">Dismiss</div>
            </div>
          </NotificationClickHandler>

          <NotificationClickHandler
            notificationData={{
              notificationId: 'notif_123',
              action: 'view_details'
            }}
            onSuccess={() => setLastAction('Viewing notification details')}
            className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium">View Details</div>
            </div>
          </NotificationClickHandler>
        </div>
      </div>

      {/* Chart Handler Examples */}
      <div className="glass p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Chart Handlers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartClickHandler
            chartData={{
              symbol: selectedSymbol,
              timeframe: '1D',
              price: 150.25,
              timestamp: new Date().toISOString()
            }}
            onSuccess={() => setLastAction(`Chart interaction for ${selectedSymbol}`)}
            className="p-4 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400 hover:bg-indigo-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Price Point Click</div>
            </div>
          </ChartClickHandler>

          <ChartClickHandler
            chartData={{
              symbol: selectedSymbol,
              timeframe: '1W'
            }}
            onSuccess={() => setLastAction(`Timeframe changed to 1W for ${selectedSymbol}`)}
            className="p-4 bg-teal-500/20 border border-teal-500/30 rounded-lg text-teal-400 hover:bg-teal-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">⏰</div>
              <div className="font-medium">Change Timeframe</div>
            </div>
          </ChartClickHandler>
        </div>
      </div>

      {/* Navigation Handler Examples */}
      <div className="glass p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Navigation Handlers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NavigationClickHandler
            navigationData={{
              route: '/trading',
              params: { symbol: selectedSymbol, mode }
            }}
            onSuccess={() => setLastAction('Navigated to trading page')}
            className="p-4 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🚀</div>
              <div className="font-medium">Go to Trading</div>
            </div>
          </NavigationClickHandler>

          <ClickHandler
            onClick={handleNavigationDemo}
            variant="ripple"
            className="p-4 bg-pink-500/20 border border-pink-500/30 rounded-lg text-pink-400 hover:bg-pink-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium">Custom Navigation</div>
            </div>
          </ClickHandler>
        </div>
      </div>

      {/* Loading State Demo */}
      <div className="glass p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Loading States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClickHandler
            loading={true}
            className="p-4 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">⏳</div>
              <div className="font-medium">Loading Button</div>
            </div>
          </ClickHandler>

          <ClickHandler
            disabled={true}
            className="p-4 bg-gray-500/20 border border-gray-500/30 rounded-lg text-gray-400"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🚫</div>
              <div className="font-medium">Disabled Button</div>
            </div>
          </ClickHandler>
        </div>
      </div>
    </div>
  );
};
