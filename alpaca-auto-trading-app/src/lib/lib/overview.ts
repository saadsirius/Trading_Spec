import { OverviewPayload, KPI, CurvePoint, PositionRow, OrderRow, WatchItem, NotificationRow } from './types/overview';

// Mock Prisma client for demo purposes
const prisma = {
  portfolioSnapshot: {
    findFirst: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
  },
  position: {
    findMany: () => Promise.resolve([]),
  },
  order: {
    findMany: () => Promise.resolve([]),
  },
  watchlistItem: {
    findMany: () => Promise.resolve([]),
  },
  priceBar: {
    findMany: () => Promise.resolve([]),
  },
};

export class OverviewAggregator {
  constructor(private userId: string, private mode: 'paper' | 'live') {}

  async getKPIs(): Promise<KPI> {
    // Mock data for demo purposes
    const equity = 12500;
    const cash = 2500;
    const dayPnL = 150;
    const totalPnL = 2500;
    const marginUsed = 0;

    return {
      equity,
      cash,
      dayPnL,
      totalPnL,
      marginUsed,
    };
  }

  async getEquityCurve(): Promise<CurvePoint[]> {
    // Mock equity curve data for demo
    const today = new Date();
    const curve: CurvePoint[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const value = 10000 + (Math.random() - 0.5) * 1000 + i * 50;
      
      curve.push({
        t: date.toISOString().split('T')[0],
        v: Math.max(8000, value),
      });
    }
    
    return curve;
  }

  async getPositions(): Promise<PositionRow[]> {
    // Mock positions data for demo
    return [
      {
        id: 'pos_1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        qty: 10,
        avg: 150.00,
        last: 152.50,
        unrealized: 25.00,
        unrealizedPct: 1.67,
      },
      {
        id: 'pos_2',
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        qty: 5,
        avg: 200.00,
        last: 195.50,
        unrealized: -22.50,
        unrealizedPct: -2.25,
      },
    ];
  }

  async getOrders(): Promise<OrderRow[]> {
    // Mock orders data for demo
    return [
      {
        id: 'order_1',
        t: new Date(Date.now() - 3600000).toISOString(),
        symbol: 'MSFT',
        side: 'buy',
        qty: 5,
        status: 'filled',
        price: 350.00,
      },
      {
        id: 'order_2',
        t: new Date(Date.now() - 7200000).toISOString(),
        symbol: 'GOOGL',
        side: 'sell',
        qty: 2,
        status: 'pending',
        price: 2800.00,
      },
    ];
  }

  async getWatchlist(): Promise<WatchItem[]> {
    // Mock watchlist data for demo
    return [
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        last: 450.25,
        changePct: 2.15,
        spark: [420, 425, 430, 435, 440, 445, 450, 448, 452, 450],
      },
      {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        last: 3200.50,
        changePct: -0.85,
        spark: [3250, 3240, 3230, 3220, 3210, 3200, 3190, 3200, 3210, 3200],
      },
      {
        symbol: 'META',
        name: 'Meta Platforms Inc.',
        last: 380.75,
        changePct: 1.25,
        spark: [370, 375, 380, 385, 390, 385, 380, 375, 380, 380],
      },
    ];
  }

  async getNotifications(): Promise<NotificationRow[]> {
    // For now, return mock notifications
    // In a real app, this would come from a notifications table
    return [
      {
        id: 'notif_1',
        title: `[${this.mode.toUpperCase()}] Order filled: AAPL 10 @ $150.25`,
        t: new Date().toISOString(),
        href: `/${this.mode}/journal?id=order_123`,
      },
      {
        id: 'notif_2',
        title: `[${this.mode.toUpperCase()}] Position opened: TSLA`,
        t: new Date(Date.now() - 3600000).toISOString(),
        href: `/${this.mode}/positions`,
      },
    ];
  }

  async getOverviewData(): Promise<OverviewPayload> {
    const [kpis, equityCurve, positions, orders, watchlist, notifications] = await Promise.all([
      this.getKPIs(),
      this.getEquityCurve(),
      this.getPositions(),
      this.getOrders(),
      this.getWatchlist(),
      this.getNotifications(),
    ]);

    return {
      mode: this.mode,
      asOf: new Date().toISOString(),
      kpis,
      equityCurve,
      positions,
      orders,
      watchlist,
      notifications,
    };
  }

  private async getAccountData(): Promise<{ equity: number; cash: number; marginUsed: number } | null> {
    try {
      // This would integrate with Alpaca SDK
      // For now, return null to use fallback data
      return null;
    } catch (error) {
      console.error('Error fetching Alpaca account data:', error);
      return null;
    }
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(percent: number): string {
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
}

export function calculatePnLColor(pnl: number): string {
  return pnl >= 0 ? 'text-support' : 'text-danger-400';
}

export function calculatePnLBgColor(pnl: number): string {
  return pnl >= 0 ? 'bg-support/20' : 'bg-danger-500/20';
}
