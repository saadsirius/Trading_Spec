'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import { clickHandler } from './ClickHandlerService';
import type { ChartClickData, NavigationClickData, NotificationClickData, OrderClickData, PositionClickData, TradingMode } from './types';

export function useClickHandlers() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();
  const lastAction = useRef<string|undefined>();

  const wrap = useCallback(async <T extends any[]>(label: string, fn: (...args: T)=> Promise<boolean>, ...args: T) => {
    setLoading(true); setError(undefined); lastAction.current = label;
    try { return await fn(...args); } catch (e:any) { setError(e?.message ?? 'Unknown error'); return false; }
    finally { setLoading(false); }
  }, []);

  return {
    handleOrderClick: (data: OrderClickData) => wrap('order', clickHandler.handleOrderClick.bind(clickHandler), data),
    handlePositionClick: (data: PositionClickData) => wrap('position', clickHandler.handlePositionClick.bind(clickHandler), data),
    handleNotificationClick: (data: NotificationClickData) => wrap('notification', clickHandler.handleNotificationClick.bind(clickHandler), data),
    handleChartClick: (data: ChartClickData) => wrap('chart', clickHandler.handleChartClick.bind(clickHandler), data),
    handleNavigationClick: (data: NavigationClickData) => wrap('nav', clickHandler.handleNavigationClick.bind(clickHandler), data),
    handleQuickBuy: (symbol: string, mode: TradingMode) => wrap('quick_buy', clickHandler.handleQuickBuy.bind(clickHandler), symbol, mode),
    handleQuickSell: (symbol: string, mode: TradingMode) => wrap('quick_sell', clickHandler.handleQuickSell.bind(clickHandler), symbol, mode),
    isLoading,
    error,
    lastAction,
  };
}

export function useOrderHandlers(mode: TradingMode) {
  const base = useClickHandlers();
  return {
    placeOrder: (symbol: string, side: 'buy'|'sell', quantity: number, orderType: 'market'|'limit'|'stop'|'stop_limit' = 'market', limitPrice?: number) =>
      base.handleOrderClick({ symbol, side, quantity, orderType, limitPrice, mode }),
    quickBuy: (symbol: string) => base.handleQuickBuy(symbol, mode),
    quickSell: (symbol: string) => base.handleQuickSell(symbol, mode),
    isLoading: base.isLoading,
    error: base.error,
  };
}

export function usePositionHandlers() {
  const base = useClickHandlers();
  return {
    closePosition: (symbol: string, positionId: string) => base.handlePositionClick({ symbol, positionId, action: 'close' }),
    modifyPosition: (symbol: string, positionId: string, payload?: Record<string,unknown>) => base.handlePositionClick({ symbol, positionId, action: 'modify', payload }),
    viewPositionDetails: (symbol: string, positionId: string) => base.handlePositionClick({ symbol, positionId, action: 'view' }),
    isLoading: base.isLoading,
    error: base.error,
  };
}

export function useNotificationHandlers() {
  const base = useClickHandlers();
  return {
    markAsRead: (notificationId: string) => base.handleNotificationClick({ notificationId, action: 'read' }),
    dismiss: (notificationId: string) => base.handleNotificationClick({ notificationId, action: 'dismiss' }),
    viewDetails: (notificationId: string) => base.handleNotificationClick({ notificationId, action: 'view' }),
    isLoading: base.isLoading,
    error: base.error,
  };
}

export function useChartHandlers() {
  const base = useClickHandlers();
  return {
    onPriceClick: (symbol: string, value: number, timestampIso: string) => base.handleChartClick({ symbol, event: 'price_click', value, timestampIso }),
    onTimeframeChange: (symbol: string, timeframe: '1m'|'5m'|'15m'|'1H'|'4H'|'1D'|'1W') => base.handleChartClick({ symbol, event: 'timeframe_change', params: { timeframe } }),
    onSymbolChange: (symbol: string, newSymbol: string) => base.handleChartClick({ symbol, event: 'symbol_change', params: { newSymbol } }),
    isLoading: base.isLoading,
    error: base.error,
  };
}
