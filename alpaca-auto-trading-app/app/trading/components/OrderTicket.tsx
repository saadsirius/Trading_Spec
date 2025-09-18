'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useOrderHandlers } from '@/lib/hooks/useClickHandlers';

interface OrderTicketProps {
  symbol: string;
  currentPrice: number;
  mode: 'paper' | 'live';
  onOrderSubmit?: (order: OrderData) => void;
}

interface OrderData {
  side: 'buy' | 'sell';
  quantity: number;
  orderType: 'market' | 'limit';
  limitPrice?: number;
}

export const OrderTicket = ({ symbol, currentPrice, mode, onOrderSubmit }: OrderTicketProps) => {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState(currentPrice);
  
  const { placeOrder, quickBuy, quickSell, isLoading, error } = useOrderHandlers(mode);

  const handleSubmit = async () => {
    try {
      const success = await placeOrder(
        symbol,
        side,
        quantity,
        orderType,
        orderType === 'limit' ? limitPrice : undefined
      );
      
      if (success && onOrderSubmit) {
        onOrderSubmit({
          side,
          quantity,
          orderType,
          limitPrice: orderType === 'limit' ? limitPrice : undefined,
        });
      }
    } catch (error) {
      console.error('Order submission failed:', error);
    }
  };

  const handleQuickBuy = async () => {
    await quickBuy(symbol);
  };

  const handleQuickSell = async () => {
    await quickSell(symbol);
  };

  return (
    <Card className="w-full max-w-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Ticket</h3>
      
      <div className="space-y-4">
        {/* Side Selection */}
        <div className="flex space-x-2">
          <Button
            variant={side === 'buy' ? 'primary' : 'secondary'}
            onClick={() => setSide('buy')}
            className="flex-1"
          >
            Buy
          </Button>
          <Button
            variant={side === 'sell' ? 'primary' : 'secondary'}
            onClick={() => setSide('sell')}
            className="flex-1"
          >
            Sell
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleQuickBuy}
            disabled={isLoading}
            className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
          >
            Quick Buy
          </Button>
          <Button
            variant="outline"
            onClick={handleQuickSell}
            disabled={isLoading}
            className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
          >
            Quick Sell
          </Button>
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Type
          </label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as 'market' | 'limit')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>

        {/* Limit Price */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limit Price
            </label>
            <input
              type="number"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Symbol:</span>
            <span className="font-medium">{symbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Side:</span>
            <span className="font-medium capitalize">{side}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Quantity:</span>
            <span className="font-medium">{quantity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Type:</span>
            <span className="font-medium capitalize">{orderType}</span>
          </div>
          {orderType === 'limit' && (
            <div className="flex justify-between text-sm">
              <span>Price:</span>
              <span className="font-medium">${limitPrice.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 mt-2 pt-2">
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>
                ${orderType === 'market' 
                  ? (currentPrice * quantity).toFixed(2) 
                  : (limitPrice * quantity).toFixed(2)
                }
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          className="w-full"
          variant={side === 'buy' ? 'primary' : 'danger'}
        >
          {isLoading ? 'Submitting...' : `${side.toUpperCase()} ${quantity} ${symbol}`}
        </Button>
      </div>
    </Card>
  );
};
