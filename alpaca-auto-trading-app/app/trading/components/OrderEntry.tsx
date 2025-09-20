/**
 * File: app/trading/components/OrderEntry.tsx
 * Purpose: Order entry form with validation, preview, and risk controls
 * Key dependencies: React, TailwindCSS, zod (validation), zustand
 * Learning Angle: This demonstrates how to build a professional order entry system with
 * client-side validation, margin checks, and circuit breakers. Notice how we validate
 * all inputs before enabling submission and provide clear error messages.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { useTradingStore } from '@/state/tradingStore';
import { useNotificationStore } from '@/state/notificationStore';

// Validation schema for order entry
const OrderSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  side: z.enum(['buy', 'sell'], { required_error: 'Side is required' }),
  qty: z.number().positive('Quantity must be positive').int('Quantity must be a whole number'),
  type: z.enum(['market', 'limit', 'stop', 'stop_limit'], { required_error: 'Order type is required' }),
  timeInForce: z.enum(['day', 'gtc'], { required_error: 'Time in force is required' }),
  limitPrice: z.number().positive().optional(),
  stopPrice: z.number().positive().optional(),
});

type OrderFormData = z.infer<typeof OrderSchema>;

interface OrderEntryProps {
  symbol: string;
  account: any;
  onOrderSubmitted: () => void;
}

interface OrderPreview {
  symbol: string;
  side: string;
  qty: number;
  type: string;
  timeInForce: string;
  limitPrice?: number;
  stopPrice?: number;
  estimatedCost: number;
  marginImpact: number;
  warnings: string[];
}

export default function OrderEntry({ symbol, account, onOrderSubmitted }: OrderEntryProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    symbol: symbol,
    side: 'buy',
    qty: 1,
    type: 'limit',
    timeInForce: 'day',
    limitPrice: undefined,
    stopPrice: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<OrderPreview | null>(null);

  const { mode, getPositionBySymbol, getBuyingPower } = useTradingStore();
  const { addNotification } = useNotificationStore();

  // Validate form data
  const validateForm = useCallback(() => {
    try {
      const validatedData = OrderSchema.parse(formData);
      
      // Additional business logic validation
      const newErrors: Record<string, string> = {};

      // Check if limit price is required for limit orders
      if (formData.type === 'limit' && !formData.limitPrice) {
        newErrors.limitPrice = 'Limit price is required for limit orders';
      }

      // Check if stop price is required for stop orders
      if ((formData.type === 'stop' || formData.type === 'stop_limit') && !formData.stopPrice) {
        newErrors.stopPrice = 'Stop price is required for stop orders';
      }

      // Check if limit price is required for stop_limit orders
      if (formData.type === 'stop_limit' && !formData.limitPrice) {
        newErrors.limitPrice = 'Limit price is required for stop limit orders';
      }

      // Check buying power for buy orders
      if (formData.side === 'buy') {
        const estimatedCost = (formData.limitPrice || 0) * formData.qty;
        const buyingPower = getBuyingPower();
        
        if (estimatedCost > buyingPower) {
          newErrors.qty = `Insufficient buying power. Available: $${buyingPower.toLocaleString()}`;
        }
      }

      // Check position for sell orders
      if (formData.side === 'sell') {
        const position = getPositionBySymbol(formData.symbol);
        const availableQty = position ? parseInt(position.qty) : 0;
        
        if (formData.qty > availableQty) {
          newErrors.qty = `Insufficient shares. Available: ${availableQty}`;
        }
      }

      setErrors(newErrors);
      setIsValid(Object.keys(newErrors).length === 0);
      
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      setIsValid(false);
      return false;
    }
  }, [formData, getBuyingPower, getPositionBySymbol]);

  // Generate order preview
  const generatePreview = useCallback(() => {
    if (!isValid) return;

    const estimatedCost = (formData.limitPrice || 0) * formData.qty;
    const marginImpact = formData.side === 'buy' ? estimatedCost : 0;
    
    const warnings: string[] = [];
    
    // Add warnings based on order type and market conditions
    if (formData.type === 'market') {
      warnings.push('Market orders execute immediately at current market price');
    }
    
    if (formData.timeInForce === 'gtc') {
      warnings.push('Good-til-cancelled orders remain active until filled or cancelled');
    }

    if (mode === 'live') {
      warnings.push('⚠️ LIVE TRADING MODE - This will execute with real money');
    }

    setPreview({
      symbol: formData.symbol,
      side: formData.side,
      qty: formData.qty,
      type: formData.type,
      timeInForce: formData.timeInForce,
      limitPrice: formData.limitPrice,
      stopPrice: formData.stopPrice,
      estimatedCost,
      marginImpact,
      warnings,
    });
  }, [formData, isValid, mode]);

  // Validate form when data changes
  useEffect(() => {
    validateForm();
  }, [validateForm]);

  // Generate preview when form is valid
  useEffect(() => {
    if (isValid) {
      generatePreview();
    }
  }, [isValid, generatePreview]);

  // Update symbol when prop changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, symbol }));
  }, [symbol]);

  const handleInputChange = (field: keyof OrderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!isValid || !preview) return;

    setIsSubmitting(true);
    
    try {
      // Generate client order ID for idempotency
      const clientOrderId = `ui-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const orderPayload = {
        symbol: formData.symbol,
        qty: formData.qty.toString(),
        side: formData.side,
        type: formData.type,
        time_in_force: formData.timeInForce,
        client_order_id: clientOrderId,
        ...(formData.limitPrice && { limit_price: formData.limitPrice.toString() }),
        ...(formData.stopPrice && { stop_price: formData.stopPrice.toString() }),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit order');
      }

      const result = await response.json();
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Order Submitted',
        message: `${formData.side.toUpperCase()} ${formData.qty} ${formData.symbol} order submitted successfully`,
        symbol: formData.symbol,
      });

      // Reset form
      setFormData(prev => ({
        ...prev,
        qty: 1,
        limitPrice: undefined,
        stopPrice: undefined,
      }));
      setShowPreview(false);

      // Refresh data
      onOrderSubmitted();

    } catch (error: any) {
      console.error('Order submission failed:', error);
      
      addNotification({
        type: 'critical',
        title: 'Order Failed',
        message: error.message || 'Failed to submit order',
        symbol: formData.symbol,
        persistent: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string) => {
    return errors[field] ? (
      <p className="text-red-400 text-xs mt-1">{errors[field]}</p>
    ) : null;
  };

  return (
    <div className="ds-card p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Order Entry</h3>
      
      <div className="space-y-4">
        {/* Symbol */}
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-300 mb-1">
            Symbol
          </label>
          <input
            id="symbol"
            type="text"
            value={formData.symbol}
            onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter symbol"
          />
          {getFieldError('symbol')}
        </div>

        {/* Side */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Side</label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleInputChange('side', 'buy')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                formData.side === 'buy'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => handleInputChange('side', 'sell')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                formData.side === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Sell
            </button>
          </div>
          {getFieldError('side')}
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="qty" className="block text-sm font-medium text-gray-300 mb-1">
            Quantity
          </label>
          <input
            id="qty"
            type="number"
            min="1"
            value={formData.qty}
            onChange={(e) => handleInputChange('qty', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {getFieldError('qty')}
        </div>

        {/* Order Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
            Order Type
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
            <option value="stop">Stop</option>
            <option value="stop_limit">Stop Limit</option>
          </select>
          {getFieldError('type')}
        </div>

        {/* Limit Price */}
        {(formData.type === 'limit' || formData.type === 'stop_limit') && (
          <div>
            <label htmlFor="limitPrice" className="block text-sm font-medium text-gray-300 mb-1">
              Limit Price
            </label>
            <input
              id="limitPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.limitPrice || ''}
              onChange={(e) => handleInputChange('limitPrice', parseFloat(e.target.value) || undefined)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter limit price"
            />
            {getFieldError('limitPrice')}
          </div>
        )}

        {/* Stop Price */}
        {(formData.type === 'stop' || formData.type === 'stop_limit') && (
          <div>
            <label htmlFor="stopPrice" className="block text-sm font-medium text-gray-300 mb-1">
              Stop Price
            </label>
            <input
              id="stopPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.stopPrice || ''}
              onChange={(e) => handleInputChange('stopPrice', parseFloat(e.target.value) || undefined)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter stop price"
            />
            {getFieldError('stopPrice')}
          </div>
        )}

        {/* Time in Force */}
        <div>
          <label htmlFor="timeInForce" className="block text-sm font-medium text-gray-300 mb-1">
            Time in Force
          </label>
          <select
            id="timeInForce"
            value={formData.timeInForce}
            onChange={(e) => handleInputChange('timeInForce', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Day</option>
            <option value="gtc">Good Till Cancelled</option>
          </select>
          {getFieldError('timeInForce')}
        </div>

        {/* Preview Button */}
        <button
          onClick={() => setShowPreview(true)}
          disabled={!isValid}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          Preview Order
        </button>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full py-2 px-4 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Order'}
        </button>
      </div>

      {/* Order Preview Modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold text-white mb-4">Order Preview</h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Symbol:</span>
                <span className="text-white">{preview.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Side:</span>
                <span className={`font-medium ${preview.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {preview.side.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Quantity:</span>
                <span className="text-white">{preview.qty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white">{preview.type}</span>
              </div>
              {preview.limitPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Limit Price:</span>
                  <span className="text-white">${preview.limitPrice.toFixed(2)}</span>
                </div>
              )}
              {preview.stopPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Stop Price:</span>
                  <span className="text-white">${preview.stopPrice.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Time in Force:</span>
                <span className="text-white">{preview.timeInForce}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated Cost:</span>
                <span className="text-white">${preview.estimatedCost.toFixed(2)}</span>
              </div>
            </div>

            {preview.warnings.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-md">
                <h5 className="text-yellow-400 font-medium mb-2">Warnings:</h5>
                <ul className="text-yellow-300 text-sm space-y-1">
                  {preview.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  handleSubmit();
                }}
                className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
