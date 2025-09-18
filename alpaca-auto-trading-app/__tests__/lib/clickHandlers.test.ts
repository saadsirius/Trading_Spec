/**
 * Tests for click handler service and utilities.
 */

import { 
  ClickHandlerService,
  clickHandler,
  handleOrderClick,
  handlePositionClick,
  handleNotificationClick,
  handleChartClick,
  handleNavigationClick,
  handleQuickBuy,
  handleQuickSell,
  OrderClickData,
  PositionClickData,
  NotificationClickData,
  ChartClickData,
  NavigationClickData
} from '@/lib/handlers/clickHandlers';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    assign: jest.fn(),
  },
  writable: true,
});

// Mock console methods
const consoleSpy = {
  error: jest.spyOn(console, 'error').mockImplementation(),
  log: jest.spyOn(console, 'log').mockImplementation(),
};

describe('ClickHandlerService', () => {
  let service: ClickHandlerService;

  beforeEach(() => {
    service = ClickHandlerService.getInstance();
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Singleton Pattern', () => {
    it('returns the same instance', () => {
      const instance1 = ClickHandlerService.getInstance();
      const instance2 = ClickHandlerService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Order Click Handling', () => {
    const validOrderData: OrderClickData = {
      symbol: 'AAPL',
      side: 'buy',
      quantity: 10,
      orderType: 'market',
      mode: 'paper',
    };

    it('validates order data correctly', async () => {
      const invalidData = {
        ...validOrderData,
        symbol: '', // Invalid empty symbol
      };

      const result = await service.handleOrderClick(invalidData as OrderClickData);
      expect(result).toBe(false);
    });

    it('handles successful order placement', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await service.handleOrderClick(validOrderData);
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/orders', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('AAPL'),
      }));
    });

    it('handles order placement failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Insufficient funds' }),
      } as Response);

      const result = await service.handleOrderClick(validOrderData);
      expect(result).toBe(false);
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.handleOrderClick(validOrderData);
      expect(result).toBe(false);
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('shows confirmation for live trading', async () => {
      const liveOrderData = { ...validOrderData, mode: 'live' as const };
      
      // Mock confirm dialog
      global.confirm = jest.fn().mockReturnValue(true);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await service.handleOrderClick(liveOrderData);
      expect(result).toBe(true);
      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('LIVE')
      );
    });

    it('cancels live order when user declines', async () => {
      const liveOrderData = { ...validOrderData, mode: 'live' as const };
      
      // Mock confirm dialog to return false
      global.confirm = jest.fn().mockReturnValue(false);

      const result = await service.handleOrderClick(liveOrderData);
      expect(result).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Position Click Handling', () => {
    const positionData: PositionClickData = {
      symbol: 'AAPL',
      action: 'close',
      positionId: 'pos_123',
    };

    it('handles position close action', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await service.handlePositionClick(positionData);
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/positions/pos_123/close',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('handles position modify action', async () => {
      const modifyData = { ...positionData, action: 'modify' as const };
      
      const result = await service.handlePositionClick(modifyData);
      expect(result).toBe(true);
    });

    it('handles position view action', async () => {
      const viewData = { ...positionData, action: 'view' as const };
      
      const result = await service.handlePositionClick(viewData);
      expect(result).toBe(true);
    });

    it('handles invalid position action', async () => {
      const invalidData = { ...positionData, action: 'invalid' as any };
      
      const result = await service.handlePositionClick(invalidData);
      expect(result).toBe(false);
    });
  });

  describe('Notification Click Handling', () => {
    const notificationData: NotificationClickData = {
      notificationId: 'notif_123',
      action: 'mark_read',
    };

    it('handles mark as read action', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await service.handleNotificationClick(notificationData);
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/notifications/notif_123/read',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('handles dismiss action', async () => {
      const dismissData = { ...notificationData, action: 'dismiss' as const };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await service.handleNotificationClick(dismissData);
      expect(result).toBe(true);
    });

    it('handles view details action', async () => {
      const viewData = { ...notificationData, action: 'view_details' as const };
      
      const result = await service.handleNotificationClick(viewData);
      expect(result).toBe(true);
    });
  });

  describe('Chart Click Handling', () => {
    const chartData: ChartClickData = {
      symbol: 'AAPL',
      timeframe: '1D',
      price: 150.25,
      timestamp: '2023-01-01T00:00:00Z',
    };

    it('handles price point click', async () => {
      const result = await service.handleChartClick(chartData);
      expect(result).toBe(true);
    });

    it('handles chart navigation', async () => {
      const navData = { symbol: 'AAPL', timeframe: '1W' };
      const result = await service.handleChartClick(navData);
      expect(result).toBe(true);
    });
  });

  describe('Navigation Click Handling', () => {
    const navigationData: NavigationClickData = {
      route: '/trading',
      params: { symbol: 'AAPL', mode: 'paper' },
    };

    it('handles navigation with parameters', async () => {
      const result = await service.handleNavigationClick(navigationData);
      expect(result).toBe(true);
      expect(window.location.href).toBe('/trading?symbol=AAPL&mode=paper');
    });

    it('handles navigation without parameters', async () => {
      const simpleNavData = { route: '/dashboard' };
      const result = await service.handleNavigationClick(simpleNavData);
      expect(result).toBe(true);
      expect(window.location.href).toBe('/dashboard');
    });
  });

  describe('Quick Actions', () => {
    it('handles quick buy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await service.handleQuickBuy('AAPL', 'paper');
      expect(result).toBe(true);
    });

    it('handles quick sell', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await service.handleQuickSell('AAPL', 'paper');
      expect(result).toBe(true);
    });
  });

  describe('Analytics', () => {
    it('tracks click analytics', async () => {
      const orderData: OrderClickData = {
        symbol: 'AAPL',
        side: 'buy',
        quantity: 10,
        orderType: 'market',
        mode: 'paper',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await service.handleOrderClick(orderData);
      
      const analytics = service.getClickAnalytics();
      expect(analytics.get('order_placed')).toBe(1);
    });

    it('tracks order success', async () => {
      const orderData: OrderClickData = {
        symbol: 'AAPL',
        side: 'buy',
        quantity: 10,
        orderType: 'market',
        mode: 'paper',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      // Mock gtag
      (window as any).gtag = jest.fn();

      await service.handleOrderClick(orderData);
      
      expect((window as any).gtag).toHaveBeenCalledWith('event', 'order_placed', {
        event_category: 'trading',
        event_label: 'AAPL_buy',
        value: 10,
        custom_parameter_mode: 'paper',
      });
    });

    it('clears analytics', () => {
      service.clearAnalytics();
      const analytics = service.getClickAnalytics();
      expect(analytics.size).toBe(0);
    });
  });

  describe('Order History', () => {
    it('tracks order history', async () => {
      const orderData: OrderClickData = {
        symbol: 'AAPL',
        side: 'buy',
        quantity: 10,
        orderType: 'market',
        mode: 'paper',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await service.handleOrderClick(orderData);
      
      const history = service.getOrderHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(orderData);
    });
  });
});

describe('Convenience Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('handleOrderClick works correctly', async () => {
    const orderData: OrderClickData = {
      symbol: 'AAPL',
      side: 'buy',
      quantity: 10,
      orderType: 'market',
      mode: 'paper',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const result = await handleOrderClick(orderData);
    expect(result).toBe(true);
  });

  it('handlePositionClick works correctly', async () => {
    const positionData: PositionClickData = {
      symbol: 'AAPL',
      action: 'close',
      positionId: 'pos_123',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const result = await handlePositionClick(positionData);
    expect(result).toBe(true);
  });

  it('handleNotificationClick works correctly', async () => {
    const notificationData: NotificationClickData = {
      notificationId: 'notif_123',
      action: 'mark_read',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const result = await handleNotificationClick(notificationData);
    expect(result).toBe(true);
  });

  it('handleChartClick works correctly', async () => {
    const chartData: ChartClickData = {
      symbol: 'AAPL',
      timeframe: '1D',
    };

    const result = await handleChartClick(chartData);
    expect(result).toBe(true);
  });

  it('handleNavigationClick works correctly', async () => {
    const navigationData: NavigationClickData = {
      route: '/trading',
    };

    const result = await handleNavigationClick(navigationData);
    expect(result).toBe(true);
  });

  it('handleQuickBuy works correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const result = await handleQuickBuy('AAPL', 'paper');
    expect(result).toBe(true);
  });

  it('handleQuickSell works correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const result = await handleQuickSell('AAPL', 'paper');
    expect(result).toBe(true);
  });
});

