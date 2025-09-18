import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/core/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'paper';

    // Get portfolio summary
    const positions = await prisma.position.findMany();
    const totalValue = positions.reduce((sum, pos) => sum + (pos.qty * pos.avgPrice), 0);
    
    // Get recent trades
    const recentTrades = await prisma.trade.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get daily PnL
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyPnl = await prisma.pnLDay.findFirst({
      where: { date: today }
    });

    const overview = {
      mode,
      portfolio: {
        totalValue,
        dayPnl: dailyPnl?.realized || 0,
        dayPnlPct: totalValue > 0 ? ((dailyPnl?.realized || 0) / totalValue) * 100 : 0,
        positions: positions.length,
        cash: 10000 // Mock cash
      },
      recentTrades: recentTrades.map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        side: trade.side,
        qty: trade.qty,
        price: trade.price,
        timestamp: trade.createdAt
      })),
      timestamp: new Date().toISOString()
    };

    console.log('Overview data fetched successfully', { mode });
    return NextResponse.json(overview);
  } catch (error) {
    console.error('Error fetching overview', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview' },
      { status: 500 }
    );
  }
}