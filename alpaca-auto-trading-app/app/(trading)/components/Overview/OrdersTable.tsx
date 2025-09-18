"use client";

import { motion } from 'framer-motion';
import { OrderRow } from '@/lib/types/overview';
import { formatCurrency } from '@/lib/overview';
import { useClickHandlers } from '@/lib/hooks/useClickHandlers';

interface OrdersTableProps {
  orders: OrderRow[];
  mode: 'paper' | 'live';
  onOrderClick?: (order: OrderRow) => void;
}

export function OrdersTable({ orders, mode, onOrderClick }: OrdersTableProps) {
  const { handleNavigationClick } = useClickHandlers();

  const handleOrderRowClick = async (order: OrderRow) => {
    if (onOrderClick) {
      onOrderClick(order);
    } else {
      // Default behavior: navigate to order details
      await handleNavigationClick({
        route: '/orders',
        params: { id: order.id }
      });
    }
  };

  const handleViewAllClick = async () => {
    await handleNavigationClick({
      route: '/orders',
      params: { mode }
    });
  };
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'filled':
        return 'text-support';
      case 'pending':
        return 'text-warning-500';
      case 'cancelled':
        return 'text-danger-400';
      default:
        return 'text-white/60';
    }
  };

  const getSideColor = (side: string) => {
    return side.toLowerCase() === 'buy' ? 'text-support' : 'text-danger-400';
  };

  if (!orders.length) {
    return (
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
          <span className="text-sm text-white/60">0 orders</span>
        </div>
        
        <div className="h-48 flex items-center justify-center text-white/60">
          <div className="text-center">
            <div className="text-4xl mb-2">📋</div>
            <p>No recent orders</p>
            <p className="text-sm mt-1">
              Your order history will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-white/60">Last 10</span>
          <button 
            onClick={handleViewAllClick}
            className="text-sm text-secondary hover:text-secondary/80 transition-colors"
          >
            View all →
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-white/60 py-3 font-medium">Time</th>
              <th className="text-left text-white/60 py-3 font-medium">Symbol</th>
              <th className="text-left text-white/60 py-3 font-medium">Side</th>
              <th className="text-right text-white/60 py-3 font-medium">Qty</th>
              <th className="text-right text-white/60 py-3 font-medium">Price</th>
              <th className="text-left text-white/60 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleOrderRowClick(order)}
                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <td className="py-3">
                  <div className="text-sm text-white">
                    {new Date(order.t).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </div>
                  <div className="text-xs text-white/60">
                    {new Date(order.t).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </td>
                <td className="py-3">
                  <span className="font-medium text-white">{order.symbol}</span>
                </td>
                <td className="py-3">
                  <span className={`font-medium capitalize ${getSideColor(order.side)}`}>
                    {order.side}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-white font-medium">
                    {order.qty.toFixed(2)}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-white font-medium">
                    {formatCurrency(order.price)}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`font-medium capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
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
