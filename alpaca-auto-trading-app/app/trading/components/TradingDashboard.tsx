'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdvancedChart } from './AdvancedChart';
import { OrderTicket } from './OrderTicket';
import { PortfolioTable } from './PortfolioTable';
import { JournalTable } from './JournalTable';
import { NotificationBell } from './NotificationBell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrendingUp, TrendingDown, DollarSign, Activity, Bell } from 'lucide-react';

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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export default function TradingDashboard() {
  const [activeTab, setActiveTab] = useState<'chart' | 'portfolio' | 'journal'>('chart');
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [currentPrice, setCurrentPrice] = useState(150.25);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const initializeData = () => {
      setIsLoading(true);
      
      // Mock positions
      setPositions([
        {
          symbol: 'AAPL',
          quantity: 100,
          avgPrice: 145.50,
          currentPrice: 150.25,
          marketValue: 15025,
          unrealizedPL: 475,
          unrealizedPLPercent: 3.26,
          side: 'long'
        },
        {
          symbol: 'GOOGL',
          quantity: 50,
          avgPrice: 2800.00,
          currentPrice: 2750.00,
          marketValue: 137500,
          unrealizedPL: -2500,
          unrealizedPLPercent: -1.79,
          side: 'long'
        }
      ]);

      // Mock trades
      setTrades([
        {
          id: '1',
          symbol: 'AAPL',
          side: 'buy',
          quantity: 100,
          price: 145.50,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'filled',
          orderType: 'market',
          notes: 'Initial position'
        },
        {
          id: '2',
          symbol: 'GOOGL',
          side: 'buy',
          quantity: 50,
          price: 2800.00,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          status: 'filled',
          orderType: 'market',
          notes: 'Tech portfolio addition'
        }
      ]);

      // Mock notifications
      setNotifications([
        {
          id: '1',
          title: 'Order Filled',
          message: 'AAPL buy order for 100 shares at $145.50 has been filled.',
          type: 'success',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false
        },
        {
          id: '2',
          title: 'AI Signal',
          message: 'Strong buy signal detected for TSLA with 85% confidence.',
          type: 'info',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: false
        }
      ]);

      setIsLoading(false);
    };

    initializeData();
  }, []);

  const handleOrderSubmit = async (orderData: any) => {
    try {
      console.log('Order submitted:', orderData);
      
      // Add new trade to journal
      const newTrade: Trade = {
        id: Date.now().toString(),
        symbol: orderData.symbol || selectedSymbol,
        side: orderData.side,
        quantity: orderData.quantity,
        price: orderData.orderType === 'market' ? currentPrice : orderData.limitPrice,
        timestamp: new Date().toISOString(),
        status: 'filled',
        orderType: orderData.orderType,
        notes: `Order placed via trading dashboard`
      };

      setTrades(prev => [newTrade, ...prev]);

      // Add notification
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: 'Order Executed',
        message: `${orderData.side.toUpperCase()} order for ${orderData.quantity} ${selectedSymbol} has been executed.`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false
      };

      setNotifications(prev => [newNotification, ...prev]);

      alert('Order submitted successfully!');
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Failed to submit order');
    }
  };

  const handleClosePosition = (symbol: string) => {
    setPositions(prev => prev.filter(pos => pos.symbol !== symbol));
    
    const notification: Notification = {
      id: Date.now().toString(),
      title: 'Position Closed',
      message: `Position in ${symbol} has been closed.`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleEditTrade = (tradeId: string) => {
    console.log('Edit trade:', tradeId);
    // Implement edit functionality
  };

  const handleDeleteTrade = (tradeId: string) => {
    setTrades(prev => prev.filter(trade => trade.id !== tradeId));
  };

  const totalValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0);
  const totalPL = positions.reduce((sum, pos) => sum + pos.unrealizedPL, 0);
  const totalPLPercent = totalValue > 0 ? (totalPL / totalValue) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Trading Dashboard</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Paper Trading</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
                onMarkAllRead={handleMarkAllRead}
              />
              <Button variant="secondary">Settings</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              {totalPL >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
              <div>
                <p className="text-sm text-gray-600">Unrealized P&L</p>
                <p className={`text-2xl font-bold ${totalPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${totalPL.toFixed(2)} ({totalPLPercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Active Positions</p>
                <p className="text-2xl font-bold text-gray-900">{positions.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Unread Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter(n => !n.read).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === 'chart' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('chart')}
          >
            Chart & Orders
          </Button>
          <Button
            variant={activeTab === 'portfolio' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio
          </Button>
          <Button
            variant={activeTab === 'journal' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('journal')}
          >
            Trade Journal
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'chart' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AdvancedChart
                symbol={selectedSymbol}
                timeframe="1Day"
              />
            </div>
            <div>
              <OrderTicket
                symbol={selectedSymbol}
                currentPrice={currentPrice}
                onOrderSubmit={handleOrderSubmit}
              />
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <PortfolioTable
            positions={positions}
            onClosePosition={handleClosePosition}
          />
        )}

        {activeTab === 'journal' && (
          <JournalTable
            trades={trades}
            onEditTrade={handleEditTrade}
            onDeleteTrade={handleDeleteTrade}
          />
        )}
      </main>
    </div>
  );
}