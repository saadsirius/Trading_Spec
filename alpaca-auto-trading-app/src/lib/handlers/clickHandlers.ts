/**
 * Centralized Click Handlers for Trading Dashboard
 * 
 * This module provides comprehensive click handling functionality for all
 * interactive elements in the trading application.
 * 
 * Pattern: Singleton with strict validations and standardized error handling
 */

import { toast } from 'react-hot-toast';

// Core types for click handler parameters
export type TradingMode = 'paper' | 'live';

export interface OrderClickData {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  limitPrice?: number;
  stopPrice?: number;
  tif?: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  mode: TradingMode;
  meta?: Record<string, unknown>;
}

export interface PositionClickData {
  symbol: string;
  action: 'close' | 'modify' | 'view';
  positionId: string;
}

export interface NotificationClickData {
  notificationId: string;
  action: 'mark_read' | 'dismiss' | 'view_details';
}

export interface ChartClickData {
  symbol: string;
  timeframe: string;
  price?: number;
  timestamp?: string;
}

export interface NavigationClickData {
  route: string;
  params?: Record<string, any>;
}

// Click Handler Service Class
export class ClickHandlerService {
  private static instance: ClickHandlerService;
  private orderHistory: OrderClickData[] = [];
  private clickAnalytics: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): ClickHandlerService {
    if (!ClickHandlerService.instance) {
      ClickHandlerService.instance = new ClickHandlerService();
    }
    return ClickHandlerService.instance;
  }

  // Order-related click handlers
  public async handleOrderClick(data: OrderClickData): Promise<boolean> {
    try {
      this.trackClick('order_placed');
      
      // Validate order data
      if (!this.validateOrderData(data)) {
        toast.error('Invalid order data');
        return false;
      }

      // Show confirmation for live trading
      if (data.mode === 'live') {
        const confirmed = await this.showLiveTradingConfirmation(data);
        if (!confirmed) return false;
      }

      // Place the order
      const result = await this.placeOrder(data);
      
      if (result.success) {
        this.orderHistory.push(data);
        toast.success(`${data.side.toUpperCase()} order for ${data.quantity} ${data.symbol} placed successfully!`);
        
        // Trigger analytics event
        this.trackOrderSuccess(data);
        
        return true;
      } else {
        toast.error(`Order failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Order click handler error:', error);
      toast.error('Failed to place order');
      return false;
    }
  }

  // Position-related click handlers
  public async handlePositionClick(data: PositionClickData): Promise<boolean> {
    try {
      this.trackClick(`position_${data.action}`);
      
      switch (data.action) {
        case 'close':
          return await this.closePosition(data);
        case 'modify':
          return await this.modifyPosition(data);
        case 'view':
          return await this.viewPositionDetails(data);
        default:
          toast.error('Invalid position action');
          return false;
      }
    } catch (error) {
      console.error('Position click handler error:', error);
      toast.error('Failed to process position action');
      return false;
    }
  }

  // Notification click handlers
  public async handleNotificationClick(data: NotificationClickData): Promise<boolean> {
    try {
      this.trackClick(`notification_${data.action}`);
      
      switch (data.action) {
        case 'mark_read':
          return await this.markNotificationRead(data.notificationId);
        case 'dismiss':
          return await this.dismissNotification(data.notificationId);
        case 'view_details':
          return await this.viewNotificationDetails(data.notificationId);
        default:
          toast.error('Invalid notification action');
          return false;
      }
    } catch (error) {
      console.error('Notification click handler error:', error);
      toast.error('Failed to process notification');
      return false;
    }
  }

  // Chart click handlers
  public async handleChartClick(data: ChartClickData): Promise<boolean> {
    try {
      this.trackClick('chart_interaction');
      
      // Handle different chart interactions
      if (data.price && data.timestamp) {
        // Price point clicked
        return await this.handlePricePointClick(data);
      } else {
        // Timeframe or symbol change
        return await this.handleChartNavigation(data);
      }
    } catch (error) {
      console.error('Chart click handler error:', error);
      toast.error('Failed to process chart interaction');
      return false;
    }
  }

  // Navigation click handlers
  public async handleNavigationClick(data: NavigationClickData): Promise<boolean> {
    try {
      this.trackClick(`navigation_${data.route}`);
      
      // Handle navigation with parameters
      if (data.params) {
        const queryString = new URLSearchParams(data.params).toString();
        window.location.href = `${data.route}?${queryString}`;
      } else {
        window.location.href = data.route;
      }
      
      return true;
    } catch (error) {
      console.error('Navigation click handler error:', error);
      toast.error('Navigation failed');
      return false;
    }
  }

  // Quick action handlers
  public async handleQuickBuy(symbol: string, mode: 'paper' | 'live'): Promise<boolean> {
    return await this.handleOrderClick({
      symbol,
      side: 'buy',
      quantity: 1,
      orderType: 'market',
      mode
    });
  }

  public async handleQuickSell(symbol: string, mode: 'paper' | 'live'): Promise<boolean> {
    return await this.handleOrderClick({
      symbol,
      side: 'sell',
      quantity: 1,
      orderType: 'market',
      mode
    });
  }

  // Private helper methods
  private validateOrderData(data: OrderClickData): boolean {
    return !!(
      data.symbol &&
      data.side &&
      data.quantity > 0 &&
      data.orderType &&
      data.mode
    );
  }

  private async showLiveTradingConfirmation(data: OrderClickData): Promise<boolean> {
    return new Promise((resolve) => {
      const message = `Are you sure you want to place a LIVE ${data.side.toUpperCase()} order for ${data.quantity} ${data.symbol}? This will use real money!`;
      resolve(confirm(message));
    });
  }

  private async placeOrder(data: OrderClickData): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: data.symbol,
          side: data.side,
          qty: data.quantity,
          type: data.orderType,
          limit_price: data.limitPrice,
          mode: data.mode,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  private async closePosition(data: PositionClickData): Promise<boolean> {
    try {
      const response = await fetch(`/api/positions/${data.positionId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Position in ${data.symbol} closed successfully`);
        return true;
      } else {
        toast.error(`Failed to close position: ${result.error}`);
        return false;
      }
    } catch (error) {
      toast.error('Failed to close position');
      return false;
    }
  }

  private async modifyPosition(data: PositionClickData): Promise<boolean> {
    // Open position modification modal
    toast.info('Position modification feature coming soon');
    return true;
  }

  private async viewPositionDetails(data: PositionClickData): Promise<boolean> {
    // Navigate to position details
    await this.handleNavigationClick({
      route: '/positions',
      params: { symbol: data.symbol, id: data.positionId }
    });
    return true;
  }

  private async markNotificationRead(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      return false;
    }
  }

  private async dismissNotification(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/dismiss`, {
        method: 'POST',
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      return false;
    }
  }

  private async viewNotificationDetails(notificationId: string): Promise<boolean> {
    await this.handleNavigationClick({
      route: '/notifications',
      params: { id: notificationId }
    });
    return true;
  }

  private async handlePricePointClick(data: ChartClickData): Promise<boolean> {
    // Show price point details
    toast.info(`Price: $${data.price} at ${data.timestamp}`);
    return true;
  }

  private async handleChartNavigation(data: ChartClickData): Promise<boolean> {
    // Update chart with new symbol/timeframe
    toast.info(`Loading chart for ${data.symbol} (${data.timeframe})`);
    return true;
  }

  private trackClick(action: string): void {
    const count = this.clickAnalytics.get(action) || 0;
    this.clickAnalytics.set(action, count + 1);
  }

  private trackOrderSuccess(data: OrderClickData): void {
    // Send analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'order_placed', {
        event_category: 'trading',
        event_label: `${data.symbol}_${data.side}`,
        value: data.quantity,
        custom_parameter_mode: data.mode
      });
    }
  }

  // Public utility methods
  public getClickAnalytics(): Map<string, number> {
    return new Map(this.clickAnalytics);
  }

  public getOrderHistory(): OrderClickData[] {
    return [...this.orderHistory];
  }

  public clearAnalytics(): void {
    this.clickAnalytics.clear();
  }
}

// Export singleton instance
export const clickHandler = ClickHandlerService.getInstance();

// Convenience functions for direct use
export const handleOrderClick = (data: OrderClickData) => clickHandler.handleOrderClick(data);
export const handlePositionClick = (data: PositionClickData) => clickHandler.handlePositionClick(data);
export const handleNotificationClick = (data: NotificationClickData) => clickHandler.handleNotificationClick(data);
export const handleChartClick = (data: ChartClickData) => clickHandler.handleChartClick(data);
export const handleNavigationClick = (data: NavigationClickData) => clickHandler.handleNavigationClick(data);
export const handleQuickBuy = (symbol: string, mode: 'paper' | 'live') => clickHandler.handleQuickBuy(symbol, mode);
export const handleQuickSell = (symbol: string, mode: 'paper' | 'live') => clickHandler.handleQuickSell(symbol, mode);
