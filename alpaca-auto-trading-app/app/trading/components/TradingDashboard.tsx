/**
 * File: app/trading/components/TradingDashboard.tsx
 * Purpose: Main trading dashboard layout with all required panels for professional trading
 * Key dependencies: React, Next.js, TailwindCSS, lightweight-charts, SSE
 * Learning Angle: This demonstrates how to structure a complex trading interface with real-time data,
 * proper state management, and risk controls. Notice how we separate concerns into focused panels.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy load heavy components for better performance
const TradingChart = dynamic(() => import('./TradingChart'), { 
  loading: () => <div className="ds-card p-4 animate-pulse h-96" /> 
});
const OrderEntry = dynamic(() => import('./OrderEntry'), { 
  loading: () => <div className="ds-card p-4 animate-pulse h-64" /> 
});
const PositionsTable = dynamic(() => import('./PositionsTable'), { 
  loading: () => <div className="ds-card p-4 animate-pulse h-64" /> 
});
const OrdersTable = dynamic(() => import('./OrdersTable'), { 
  loading: () => <div className="ds-card p-4 animate-pulse h-64" /> 
});
const RiskPanel = dynamic(() => import('./RiskPanel'), { 
  loading: () => <div className="ds-card p-4 animate-pulse h-48" /> 
});

// Import notification components
import NotificationBell from '@/components/notifications/NotificationBell';
import ToastRail from '@/components/notifications/ToastRail';

// Import trading state management
import { useTradingStore } from '@/state/tradingStore';
import { useNotificationStore } from '@/state/notificationStore';

// Types for trading data
interface TradingState {
  mode: 'paper' | 'live';
  account: any;
  positions: any[];
  orders: any[];
  selectedSymbol: string;
  isConnected: boolean;
  lastUpdate: Date;
}

export default function TradingDashboard() {
  const router = useRouter();
  const [tradingState, setTradingState] = useState<TradingState>({
    mode: 'paper',
    account: null,
    positions: [],
    orders: [],
    selectedSymbol: 'SPY',
    isConnected: false,
    lastUpdate: new Date()
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trading store for global state
  const { 
    switchMode, 
    updateAccount, 
    updatePositions, 
    updateOrders,
    selectedSymbol,
    setSelectedSymbol 
  } = useTradingStore();

  // Notification store for alerts
  const { notifications, markAsRead } = useNotificationStore();

  // Initialize trading data
  const initializeTrading = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch account information
      const accountResponse = await fetch('/api/account');
      if (!accountResponse.ok) {
        throw new Error(`Account fetch failed: ${accountResponse.status}`);
      }
      const account = await accountResponse.json();
      
      // Fetch positions
      const positionsResponse = await fetch('/api/positions');
      const positions = positionsResponse.ok ? await positionsResponse.json() : [];
      
      // Fetch open orders
      const ordersResponse = await fetch('/api/orders?status=open');
      const orders = ordersResponse.ok ? await ordersResponse.json() : [];

      setTradingState(prev => ({
        ...prev,
        account,
        positions,
        orders,
        isConnected: true,
        lastUpdate: new Date()
      }));

      // Update global store
      updateAccount(account);
      updatePositions(positions);
      updateOrders(orders);

    } catch (err: any) {
      console.error('Failed to initialize trading data:', err);
      setError(err.message || 'Failed to load trading data');
      setTradingState(prev => ({ ...prev, isConnected: false }));
    } finally {
      setIsLoading(false);
    }
  }, [updateAccount, updatePositions, updateOrders]);

  // Handle mode switching (Paper ↔ Live)
  const handleModeSwitch = useCallback(async (newMode: 'paper' | 'live') => {
    if (newMode === 'live') {
      const confirmed = window.confirm(
        '⚠️ WARNING: You are about to switch to LIVE trading mode.\n\n' +
        'This will use real money and execute real trades.\n' +
        'Are you absolutely sure you want to continue?'
      );
      if (!confirmed) return;
    }

    try {
      await switchMode(newMode);
      setTradingState(prev => ({ ...prev, mode: newMode }));
      await initializeTrading(); // Refresh data for new mode
    } catch (err: any) {
      console.error('Failed to switch trading mode:', err);
      setError(`Failed to switch to ${newMode} mode: ${err.message}`);
    }
  }, [switchMode, initializeTrading]);

  // Handle symbol selection
  const handleSymbolSelect = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
    setTradingState(prev => ({ ...prev, selectedSymbol: symbol }));
  }, [setSelectedSymbol]);

  // Initialize on mount
  useEffect(() => {
    initializeTrading();
  }, [initializeTrading]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (tradingState.isConnected) {
        initializeTrading();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [tradingState.isConnected, initializeTrading]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="ds-card p-4 animate-pulse h-16" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 space-y-4">
              <div className="ds-card p-4 animate-pulse h-96" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="ds-card p-4 animate-pulse h-64" />
                <div className="ds-card p-4 animate-pulse h-64" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="ds-card p-4 animate-pulse h-64" />
              <div className="ds-card p-4 animate-pulse h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div role="alert" className="ds-card p-6 text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-4">Trading Dashboard Error</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={initializeTrading}
              className="btn btn-primary"
              aria-label="Retry loading trading data"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Toast notifications */}
      <ToastRail />
      
      {/* Top navigation bar */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Logo and mode selector */}
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">Trading Dashboard</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Mode:</span>
                <button
                  onClick={() => handleModeSwitch('paper')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    tradingState.mode === 'paper'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                  aria-label="Switch to paper trading mode"
                >
                  Paper
                </button>
                <button
                  onClick={() => handleModeSwitch('live')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    tradingState.mode === 'live'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                  aria-label="Switch to live trading mode"
                >
                  Live
                </button>
              </div>
            </div>

            {/* Center: Account summary */}
            <div className="flex items-center space-x-6 text-sm">
              {tradingState.account && (
                <>
                  <div className="text-center">
                    <div className="text-gray-400">Equity</div>
                    <div className="font-semibold text-white">
                      ${parseFloat(tradingState.account.equity || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Buying Power</div>
                    <div className="font-semibold text-white">
                      ${parseFloat(tradingState.account.buying_power || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Day P&L</div>
                    <div className={`font-semibold ${
                      parseFloat(tradingState.account.daytrading_buying_power || 0) >= 0
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}>
                      ${parseFloat(tradingState.account.daytrading_buying_power || 0).toLocaleString()}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right: Connection status and notifications */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  tradingState.isConnected ? 'bg-emerald-400' : 'bg-red-400'
                }`} />
                <span className="text-sm text-gray-400">
                  {tradingState.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <NotificationBell />
            </div>
          </div>
        </div>
      </header>

      {/* Main dashboard content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left column: Chart and order entry */}
          <div className="lg:col-span-3 space-y-4">
            {/* Symbol overview and chart */}
            <div className="ds-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  {tradingState.selectedSymbol} - Market Overview
                </h2>
                <div className="flex space-x-2">
                  {['1m', '5m', '1h', '1d'].map((timeframe) => (
                    <button
                      key={timeframe}
                      className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>
              </div>
              <TradingChart symbol={tradingState.selectedSymbol} />
            </div>

            {/* Order entry and positions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <OrderEntry 
                symbol={tradingState.selectedSymbol}
                account={tradingState.account}
                onOrderSubmitted={initializeTrading}
              />
              <PositionsTable 
                positions={tradingState.positions}
                onPositionUpdate={initializeTrading}
              />
            </div>

            {/* Orders table */}
            <OrdersTable 
              orders={tradingState.orders}
              onOrderUpdate={initializeTrading}
            />
          </div>

          {/* Right column: Risk panel and watchlist */}
          <div className="space-y-4">
            <RiskPanel 
              account={tradingState.account}
              positions={tradingState.positions}
            />
            
            {/* Watchlist component would go here */}
            <div className="ds-card p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Watchlist</h3>
              <div className="space-y-2">
                {['AAPL', 'MSFT', 'GOOGL', 'TSLA'].map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => handleSymbolSelect(symbol)}
                    className={`w-full text-left p-2 rounded transition-colors ${
                      tradingState.selectedSymbol === symbol
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}