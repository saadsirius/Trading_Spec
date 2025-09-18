/**
 * React Hook for Click Handlers
 * 
 * This hook provides easy integration of click handlers into React components
 * with proper state management and error handling.
 */

import { useState, useCallback } from 'react';
import { 
  clickHandler, 
  OrderClickData, 
  PositionClickData, 
  NotificationClickData, 
  ChartClickData, 
  NavigationClickData 
} from '../handlers/clickHandlers';

export interface UseClickHandlersReturn {
  // Order handlers
  handleOrderClick: (data: OrderClickData) => Promise<boolean>;
  handleQuickBuy: (symbol: string, mode: 'paper' | 'live') => Promise<boolean>;
  handleQuickSell: (symbol: string, mode: 'paper' | 'live') => Promise<boolean>;
  
  // Position handlers
  handlePositionClick: (data: PositionClickData) => Promise<boolean>;
  
  // Notification handlers
  handleNotificationClick: (data: NotificationClickData) => Promise<boolean>;
  
  // Chart handlers
  handleChartClick: (data: ChartClickData) => Promise<boolean>;
  
  // Navigation handlers
  handleNavigationClick: (data: NavigationClickData) => Promise<boolean>;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastAction: string | null;
}

export function useClickHandlers(): UseClickHandlersReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const executeWithLoading = useCallback(async <T>(
    action: () => Promise<T>,
    actionName: string
  ): Promise<T> => {
    setIsLoading(true);
    setError(null);
    setLastAction(actionName);
    
    try {
      const result = await action();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOrderClick = useCallback(async (data: OrderClickData): Promise<boolean> => {
    return await executeWithLoading(
      () => clickHandler.handleOrderClick(data),
      `order_${data.side}_${data.symbol}`
    );
  }, [executeWithLoading]);

  const handleQuickBuy = useCallback(async (symbol: string, mode: 'paper' | 'live'): Promise<boolean> => {
    return await executeWithLoading(
      () => clickHandler.handleQuickBuy(symbol, mode),
      `quick_buy_${symbol}`
    );
  }, [executeWithLoading]);

  const handleQuickSell = useCallback(async (symbol: string, mode: 'paper' | 'live'): Promise<boolean> => {
    return await executeWithLoading(
      () => clickHandler.handleQuickSell(symbol, mode),
      `quick_sell_${symbol}`
    );
  }, [executeWithLoading]);

  const handlePositionClick = useCallback(async (data: PositionClickData): Promise<boolean> => {
    return await executeWithLoading(
      () => clickHandler.handlePositionClick(data),
      `position_${data.action}_${data.symbol}`
    );
  }, [executeWithLoading]);

  const handleNotificationClick = useCallback(async (data: NotificationClickData): Promise<boolean> => {
    return await executeWithLoading(
      () => clickHandler.handleNotificationClick(data),
      `notification_${data.action}`
    );
  }, [executeWithLoading]);

  const handleChartClick = useCallback(async (data: ChartClickData): Promise<boolean> => {
    return await executeWithLoading(
      () => clickHandler.handleChartClick(data),
      `chart_${data.symbol}`
    );
  }, [executeWithLoading]);

  const handleNavigationClick = useCallback(async (data: NavigationClickData): Promise<boolean> => {
    return await executeWithLoading(
      () => clickHandler.handleNavigationClick(data),
      `navigation_${data.route}`
    );
  }, [executeWithLoading]);

  return {
    handleOrderClick,
    handleQuickBuy,
    handleQuickSell,
    handlePositionClick,
    handleNotificationClick,
    handleChartClick,
    handleNavigationClick,
    isLoading,
    error,
    lastAction
  };
}

// Specialized hooks for specific use cases
export function useOrderHandlers(mode: 'paper' | 'live') {
  const { handleOrderClick, handleQuickBuy, handleQuickSell, isLoading, error } = useClickHandlers();

  const placeOrder = useCallback(async (
    symbol: string,
    side: 'buy' | 'sell',
    quantity: number,
    orderType: 'market' | 'limit' = 'market',
    limitPrice?: number
  ) => {
    return await handleOrderClick({
      symbol,
      side,
      quantity,
      orderType,
      limitPrice,
      mode
    });
  }, [handleOrderClick, mode]);

  const quickBuy = useCallback(async (symbol: string) => {
    return await handleQuickBuy(symbol, mode);
  }, [handleQuickBuy, mode]);

  const quickSell = useCallback(async (symbol: string) => {
    return await handleQuickSell(symbol, mode);
  }, [handleQuickSell, mode]);

  return {
    placeOrder,
    quickBuy,
    quickSell,
    isLoading,
    error
  };
}

export function usePositionHandlers() {
  const { handlePositionClick, isLoading, error } = useClickHandlers();

  const closePosition = useCallback(async (symbol: string, positionId: string) => {
    return await handlePositionClick({
      symbol,
      action: 'close',
      positionId
    });
  }, [handlePositionClick]);

  const modifyPosition = useCallback(async (symbol: string, positionId: string) => {
    return await handlePositionClick({
      symbol,
      action: 'modify',
      positionId
    });
  }, [handlePositionClick]);

  const viewPositionDetails = useCallback(async (symbol: string, positionId: string) => {
    return await handlePositionClick({
      symbol,
      action: 'view',
      positionId
    });
  }, [handlePositionClick]);

  return {
    closePosition,
    modifyPosition,
    viewPositionDetails,
    isLoading,
    error
  };
}

export function useNotificationHandlers() {
  const { handleNotificationClick, isLoading, error } = useClickHandlers();

  const markAsRead = useCallback(async (notificationId: string) => {
    return await handleNotificationClick({
      notificationId,
      action: 'mark_read'
    });
  }, [handleNotificationClick]);

  const dismiss = useCallback(async (notificationId: string) => {
    return await handleNotificationClick({
      notificationId,
      action: 'dismiss'
    });
  }, [handleNotificationClick]);

  const viewDetails = useCallback(async (notificationId: string) => {
    return await handleNotificationClick({
      notificationId,
      action: 'view_details'
    });
  }, [handleNotificationClick]);

  return {
    markAsRead,
    dismiss,
    viewDetails,
    isLoading,
    error
  };
}

export function useChartHandlers() {
  const { handleChartClick, isLoading, error } = useClickHandlers();

  const onPriceClick = useCallback(async (symbol: string, price: number, timestamp: string) => {
    return await handleChartClick({
      symbol,
      timeframe: '1D',
      price,
      timestamp
    });
  }, [handleChartClick]);

  const onTimeframeChange = useCallback(async (symbol: string, timeframe: string) => {
    return await handleChartClick({
      symbol,
      timeframe
    });
  }, [handleChartClick]);

  const onSymbolChange = useCallback(async (symbol: string) => {
    return await handleChartClick({
      symbol,
      timeframe: '1D'
    });
  }, [handleChartClick]);

  return {
    onPriceClick,
    onTimeframeChange,
    onSymbolChange,
    isLoading,
    error
  };
}
