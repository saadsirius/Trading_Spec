import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const mode = searchParams.get('mode') || 'paper';
    const timeframe = searchParams.get('timeframe') || '1M';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case '1D':
        startDate.setDate(now.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
        startDate = new Date('2020-01-01'); // Arbitrary start date
        break;
    }

    // Fetch portfolio snapshots
    const snapshots = await prisma.portfolioSnapshot.findMany({
      where: {
        userId,
        mode: mode.toUpperCase() as 'PAPER' | 'LIVE',
        snapshotDate: {
          gte: startDate,
        },
      },
      include: {
        instrument: {
          select: {
            symbol: true,
            name: true,
            type: true,
            sector: true,
          },
        },
      },
      orderBy: {
        snapshotDate: 'asc',
      },
    });

    // Group snapshots by date and calculate portfolio metrics
    const portfolioData = groupSnapshotsByDate(snapshots);

    // Get current positions
    const currentPositions = await getCurrentPositions(userId, mode);

    // Get performance metrics
    const performanceMetrics = await getPerformanceMetrics(userId, mode, startDate);

    return NextResponse.json({
      portfolioData,
      currentPositions,
      performanceMetrics,
      timeframe,
      mode,
    });

  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, mode, snapshotData } = body;

    if (!userId || !mode || !snapshotData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create portfolio snapshot
    const snapshot = await prisma.portfolioSnapshot.createMany({
      data: snapshotData.map((position: any) => ({
        userId,
        mode: mode.toUpperCase() as 'PAPER' | 'LIVE',
        instrumentId: position.instrumentId,
        quantity: position.quantity,
        avgPrice: position.avgPrice,
        currentPrice: position.currentPrice,
        marketValue: position.marketValue,
        unrealizedPL: position.unrealizedPL,
        unrealizedPLPercent: position.unrealizedPLPercent,
        realizedPL: position.realizedPL || 0,
        totalReturn: position.totalReturn || 0,
        totalReturnPercent: position.totalReturnPercent || 0,
        positionSize: position.positionSize,
        riskContribution: position.riskContribution,
      })),
    });

    return NextResponse.json({ success: true, count: snapshot.count }, { status: 201 });

  } catch (error) {
    console.error('Error creating portfolio snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio snapshot' },
      { status: 500 }
    );
  }
}

// Helper functions
function groupSnapshotsByDate(snapshots: any[]) {
  const grouped: { [date: string]: any } = {};

  snapshots.forEach(snapshot => {
    const date = snapshot.snapshotDate.toISOString().split('T')[0];
    
    if (!grouped[date]) {
      grouped[date] = {
        date,
        totalValue: 0,
        totalReturn: 0,
        totalReturnPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
        positions: [],
      };
    }

    grouped[date].totalValue += snapshot.marketValue;
    grouped[date].totalReturn += snapshot.unrealizedPL + snapshot.realizedPL;
    grouped[date].positions.push({
      id: snapshot.id,
      symbol: snapshot.instrument.symbol,
      name: snapshot.instrument.name,
      type: snapshot.instrument.type,
      sector: snapshot.instrument.sector,
      quantity: snapshot.quantity,
      avgPrice: snapshot.avgPrice,
      currentPrice: snapshot.currentPrice,
      marketValue: snapshot.marketValue,
      unrealizedPL: snapshot.unrealizedPL,
      unrealizedPLPercent: snapshot.unrealizedPLPercent,
      realizedPL: snapshot.realizedPL,
      totalReturn: snapshot.totalReturn,
      totalReturnPercent: snapshot.totalReturnPercent,
      positionSize: snapshot.positionSize,
    });
  });

  // Calculate day changes
  const sortedDates = Object.keys(grouped).sort();
  sortedDates.forEach((date, index) => {
    const current = grouped[date];
    
    if (index > 0) {
      const previous = grouped[sortedDates[index - 1]];
      current.dayChange = current.totalValue - previous.totalValue;
      current.dayChangePercent = (current.dayChange / previous.totalValue) * 100;
    }
    
    current.totalReturnPercent = current.totalValue > 0 
      ? (current.totalReturn / current.totalValue) * 100 
      : 0;
  });

  return sortedDates.map(date => grouped[date]);
}

async function getCurrentPositions(userId: string, mode: string) {
  const positions = await prisma.position.findMany({
    where: {
      userId,
      // Note: You might need to add mode filtering to Position model
    },
    include: {
      user: {
        select: {
          accountLinks: {
            where: {
              isLiveMode: mode === 'live',
            },
          },
        },
      },
    },
  });

  return positions.map(position => ({
    id: position.id,
    symbol: position.symbol,
    side: position.side,
    quantity: position.quantity,
    avgPrice: position.avgPrice,
    marketValue: position.marketValue,
    unrealizedPL: position.unrealizedPL,
    unrealizedPLPercent: position.unrealizedPLPercent,
  }));
}

async function getPerformanceMetrics(userId: string, mode: string, startDate: Date) {
  // Get all trades for the period
  const trades = await prisma.tradeJournal.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Calculate basic metrics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(trade => 
    trade.side === 'sell' && trade.price > 0 // Simplified logic
  ).length;
  
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  // Calculate returns
  let totalReturn = 0;
  let totalInvestment = 0;
  
  trades.forEach(trade => {
    if (trade.side === 'buy') {
      totalInvestment += trade.price * trade.quantity;
    } else if (trade.side === 'sell') {
      totalReturn += trade.price * trade.quantity;
    }
  });

  const totalReturnPercent = totalInvestment > 0 
    ? ((totalReturn - totalInvestment) / totalInvestment) * 100 
    : 0;

  return {
    totalTrades,
    winningTrades,
    winRate,
    totalReturn,
    totalReturnPercent,
    totalInvestment,
  };
}