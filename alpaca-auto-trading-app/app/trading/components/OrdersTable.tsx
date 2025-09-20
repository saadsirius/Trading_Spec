/**
 * File: app/trading/components/OrdersTable.tsx
 * Purpose: Orders table with real-time status updates and order management
 * Key dependencies: React, TailwindCSS, zustand
 * Learning Angle: This demonstrates how to display and manage trading orders with
 * real-time status updates, proper order lifecycle handling, and risk controls.
 * Notice how we handle different order types and provide clear action buttons.
 */

'use client';

import { useState, useCallback } from 'react';
import { useTradingStore } from '@/state/tradingStore';
import { useNotificationStore } from '@/state/notificationStore';

interface OrdersTableProps {
  orders: any[];
  onOrderUpdate: () => void;
}

interface Order {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at?: string;
  expired_at?: string;
  canceled_at?: string;
  failed_at?: string;
  replaced_at?: string;
  replaced_by?: string;
  replaces?: string;
  asset_id: string;
  symbol: string;
  asset_class: string;
  notional?: string;
  qty?: string;
  filled_qty: string;
  filled_avg_price?: string;
  order_class: string;
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  side: 'buy' | 'sell';
  time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: string;
  stop_price?: string;
  status: 'new' | 'partially_filled' | 'filled' | 'done_for_day' | 'canceled' | 'expired' | 'replaced' | 'pending_cancel' | 'pending_replace' | 'accepted' | 'pending_new' | 'accepted_for_bidding' | 'stopped' | 'rejected' | 'suspended' | 'calculated';
  extended_hours: boolean;
  legs?: any[];
  trail_percent?: string;
  trail_price?: string;
  hwm?: string;
}

export default function OrdersTable({ orders, onOrderUpdate }: OrdersTableProps) {
  const [isCanceling, setIsCanceling] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState<string | null>(null);
  const { mode } = useTradingStore();
  const { addNotification } = useNotificationStore();

  const handleCancelOrder = useCallback(async (order: Order) => {
    if (isCanceling) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel this order?\n\n` +
      `${order.side.toUpperCase()} ${order.qty} ${order.symbol} ${order.type} order\n` +
      `Status: ${order.status}\n\n` +
      `${mode === 'live' ? '⚠️ This will cancel a real order!' : 'This is a paper trade.'}`
    );

    if (!confirmed) return;

    setIsCanceling(order.id);

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel order');
      }

      addNotification({
        type: 'success',
        title: 'Order Cancelled',
        message: `Successfully cancelled ${order.side} order for ${order.symbol}`,
        symbol: order.symbol,
      });

      // Refresh orders
      onOrderUpdate();

    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      
      addNotification({
        type: 'critical',
        title: 'Order Cancel Failed',
        message: error.message || 'Failed to cancel order',
        symbol: order.symbol,
        persistent: true,
      });
    } finally {
      setIsCanceling(null);
    }
  }, [isCanceling, mode, addNotification, onOrderUpdate]);

  const handleReplaceOrder = useCallback(async (order: Order) => {
    if (isReplacing) return;

    // In a real implementation, this would open a replace order dialog
    // For now, we'll just show a notification
    addNotification({
      type: 'info',
      title: 'Replace Order',
      message: 'Replace order functionality would be implemented here',
      symbol: order.symbol,
    });
  }, [isReplacing, addNotification]);

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled':
        return 'text-emerald-400';
      case 'partially_filled':
        return 'text-yellow-400';
      case 'canceled':
      case 'expired':
      case 'rejected':
        return 'text-red-400';
      case 'new':
      case 'accepted':
      case 'pending_new':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSideColor = (side: string) => {
    return side === 'buy' ? 'text-emerald-400' : 'text-red-400';
  };

  const getSideIcon = (side: string) => {
    return side === 'buy' ? '↗️' : '↘️';
  };

  const canCancel = (order: Order) => {
    return ['new', 'accepted', 'pending_new', 'partially_filled'].includes(order.status);
  };

  const canReplace = (order: Order) => {
    return ['new', 'accepted', 'pending_new'].includes(order.status);
  };

  // Filter to show only open orders
  const openOrders = orders.filter(order => 
    ['new', 'accepted', 'pending_new', 'partially_filled', 'pending_cancel', 'pending_replace'].includes(order.status)
  );

  if (openOrders.length === 0) {
    return (
      <div className="ds-card p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Open Orders</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">No open orders</div>
          <div className="text-gray-500 text-sm">Your open orders will appear here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Open Orders</h3>
        <div className="text-sm text-gray-400">
          {openOrders.length} order{openOrders.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 text-gray-400 font-medium">Symbol</th>
              <th className="text-left py-2 text-gray-400 font-medium">Side</th>
              <th className="text-left py-2 text-gray-400 font-medium">Type</th>
              <th className="text-right py-2 text-gray-400 font-medium">Qty</th>
              <th className="text-right py-2 text-gray-400 font-medium">Price</th>
              <th className="text-left py-2 text-gray-400 font-medium">TIF</th>
              <th className="text-left py-2 text-gray-400 font-medium">Status</th>
              <th className="text-right py-2 text-gray-400 font-medium">Filled</th>
              <th className="text-left py-2 text-gray-400 font-medium">Submitted</th>
              <th className="text-center py-2 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {openOrders.map((order: Order) => (
              <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="py-3">
                  <div className="font-semibold text-white">{order.symbol}</div>
                  <div className="text-xs text-gray-500">{order.client_order_id}</div>
                </td>
                <td className="py-3">
                  <div className={`flex items-center space-x-1 ${getSideColor(order.side)}`}>
                    <span>{getSideIcon(order.side)}</span>
                    <span className="font-medium capitalize">{order.side}</span>
                  </div>
                </td>
                <td className="py-3">
                  <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                    {order.type}
                  </span>
                </td>
                <td className="py-3 text-right font-mono text-white">
                  {order.qty ? parseInt(order.qty).toLocaleString() : '—'}
                </td>
                <td className="py-3 text-right">
                  <div className="font-mono text-white">
                    {order.limit_price ? formatCurrency(order.limit_price) : 'Market'}
                  </div>
                  {order.stop_price && (
                    <div className="text-xs text-gray-400">
                      Stop: {formatCurrency(order.stop_price)}
                    </div>
                  )}
                </td>
                <td className="py-3">
                  <span className="text-gray-300 uppercase">
                    {order.time_in_force}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <div className="font-mono text-white">
                    {parseInt(order.filled_qty).toLocaleString()}
                    {order.qty && ` / ${parseInt(order.qty).toLocaleString()}`}
                  </div>
                  {order.filled_avg_price && (
                    <div className="text-xs text-gray-400">
                      @ {formatCurrency(order.filled_avg_price)}
                    </div>
                  )}
                </td>
                <td className="py-3">
                  <div className="text-gray-300 text-xs">
                    {formatDateTime(order.submitted_at)}
                  </div>
                </td>
                <td className="py-3 text-center">
                  <div className="flex space-x-1">
                    {canCancel(order) && (
                      <button
                        onClick={() => handleCancelOrder(order)}
                        disabled={isCanceling === order.id}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        title="Cancel order"
                      >
                        {isCanceling === order.id ? '...' : 'Cancel'}
                      </button>
                    )}
                    {canReplace(order) && (
                      <button
                        onClick={() => handleReplaceOrder(order)}
                        disabled={isReplacing === order.id}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        title="Replace order"
                      >
                        {isReplacing === order.id ? '...' : 'Replace'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
