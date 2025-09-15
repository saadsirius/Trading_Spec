import { PrismaClient } from '@prisma/client';
import { OverviewPayload, KPI, CurvePoint, PositionRow, OrderRow, WatchItem, NotificationRow } from './types/overview';

const prisma = new PrismaClient();

export class OverviewAggregator {
  constructor(private userId: string, private mode: 'paper' | 'live') {}

  async getKPIs(): Promise<KPI> {
    // Get account data from Alpaca (preferred) or fallback to PortfolioSnapshot
    const accountData = await this.getAccountData();
    
    // Get latest portfolio snapshot
    const latestSnapshot = await prisma.portfolioSnapshot.findFirst({
      where: {
        userId: this.userId,
        mode: this.mode.toUpperCase() as 'PAPER' | 'LIVE',
      },
      orderBy: { snapshotDate: 'desc' },
    });

    // Calculate day P&L from previous day's snapshot
    const previousSnapshot = await prisma.portfolioSnapshot.findFirst({
      where: {
        userId: this.userId,
        mode: this.mode.toUpperCase() as 'PAPER' | 'LIVE',
        snapshotDate: {
          lt: latestSnapshot?.snapshotDate,
        },
      },
      orderBy: { snapshotDate: 'desc' },
    });

    const equity = accountData?.equity || latestSnapshot?.marketValue || 10000;
    const cash = accountData?.cash || 1000;
    const dayPnL = previousSnapshot 
      ? equity - previousSnapshot.marketValue 
      : 0;
    const totalPnL = equity - 10000; // Assuming 10k starting capital
    const marginUsed = accountData?.marginUsed || 0;

    return {
      equity,
      cash,
      dayPnL,
      totalPnL,
      marginUsed,
    };
  }

  async getEquityCurve(): Promise<CurvePoint[]> {
    const snapshots = await prisma.portfolioSnapshot.findMany({
      where: {
        userId: this.userId,
        mode: this.mode.toUpperCase() as 'PAPER' | 'LIVE',
      },
      orderBy: { snapshotDate: 'asc' },
      take: 90, // Last 90 days
    });

    return snapshots.map(snapshot => ({
      t: snapshot.snapshotDate.toISOString().split('T')[0],
      v: snapshot.marketValue,
    }));
  }

  async getPositions(): Promise<PositionRow[]> {
    const positions = await prisma.position.findMany({
      where: {
        userId: this.userId,
      },
      include: {
        // Note: We'll need to join with Instrument table for symbol details
        // For now, using basic position data
      },
    });

    return positions.map(position => ({
      id: position.id,
      symbol: position.symbol,
      name: position.symbol, // TODO: Get from Instrument table
      qty: position.quantity,
      avg: position.avgPrice,
      last: position.marketValue / position.quantity, // Calculate current price
      unrealized: position.unrealizedPL,
      unrealizedPct: position.unrealizedPLPercent,
    }));
  }

  async getOrders(): Promise<OrderRow[]> {
    const orders = await prisma.order.findMany({
      where: {
        userId: this.userId,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return orders.map(order => ({
      id: order.id,
      t: order.createdAt.toISOString(),
      symbol: order.symbol,
      side: order.side as 'buy' | 'sell',
      qty: order.quantity,
      status: order.status,
      price: order.limitPrice || order.stopPrice || 0,
    }));
  }

  async getWatchlist(): Promise<WatchItem[]> {
    const watchlistItems = await prisma.watchlistItem.findMany({
      where: {
        watchlist: {
          userId: this.userId,
        },
      },
      include: {
        instrument: {
          select: {
            symbol: true,
            name: true,
            price: true,
            changePercent: true,
          },
        },
      },
    });

    const watchItems: WatchItem[] = [];

    for (const item of watchlistItems) {
      // Get sparkline data (last 30 days)
      const priceBars = await prisma.priceBar.findMany({
        where: {
          instrumentId: item.instrumentId,
          timeframe: '1D',
        },
        orderBy: { timestamp: 'desc' },
        take: 30,
        select: { close: true },
      });

      const spark = priceBars
        .reverse()
        .map(bar => bar.close);

      watchItems.push({
        symbol: item.instrument.symbol,
        name: item.instrument.name,
        last: item.instrument.price,
        changePct: item.instrument.changePercent,
        spark,
      });
    }

    return watchItems;
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
