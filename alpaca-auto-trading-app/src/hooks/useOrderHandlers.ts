import { useCallback, useState } from 'react';
import { clickHandlerService } from '@/services/ClickHandlerService';
import type { OrderInput } from '@/lib/zodSchemas';

export function useOrderHandlers() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitOrder = useCallback(async (orderData: OrderInput): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const result = await clickHandlerService.submitOrder(orderData);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
    return await clickHandlerService.cancelOrder(orderId);
  }, []);

  const submitMarketOrder = useCallback(async (
    symbol: string,
    side: 'buy' | 'sell',
    qty: number
  ): Promise<boolean> => {
    return await submitOrder({
      symbol,
      side,
      qty,
      type: 'market',
      time_in_force: 'day',
    });
  }, [submitOrder]);

  const submitLimitOrder = useCallback(async (
    symbol: string,
    side: 'buy' | 'sell',
    qty: number,
    limitPrice: number
  ): Promise<boolean> => {
    return await submitOrder({
      symbol,
      side,
      qty,
      type: 'limit',
      limit_price: limitPrice,
      time_in_force: 'day',
    });
  }, [submitOrder]);

  return {
    submitOrder,
    cancelOrder,
    submitMarketOrder,
    submitLimitOrder,
    isSubmitting,
  };
}
