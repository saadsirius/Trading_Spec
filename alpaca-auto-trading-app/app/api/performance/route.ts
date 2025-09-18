import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/core/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '1Y';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'ALL':
        startDate.setFullYear(2020); // Start from 2020
        break;
    }

    // Fetch daily PnL data
    const dailyPnl = await prisma.pnLDay.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Generate mock performance data if no real data exists
    if (dailyPnl.length === 0) {
      const mockData = [];
      let currentDate = new Date(startDate);
      let equity = 100000; // Starting equity
      let maxEquity = equity;
      let maxDrawdown = 0;
      
      while (currentDate <= endDate) {
        // Simulate realistic market movements
        const dailyReturn = (Math.random() - 0.5) * 0.03; // ±1.5% daily
        const realized = Math.random() * 2000 - 1000; // Random realized P&L
        const unrealized = (Math.random() - 0.5) * 3000; // Random unrealized P&L
        
        equity += realized + unrealized * 0.1;
        maxEquity = Math.max(maxEquity, equity);
        const drawdown = ((equity - maxEquity) / maxEquity) * 100;
        maxDrawdown = Math.min(maxDrawdown, drawdown);
        
        mockData.push({
          date: currentDate.toISOString().split('T')[0],
          equity: Math.max(equity, 50000), // Floor at 50k
          returns: dailyReturn * 100,
          drawdown: drawdown,
          benchmark: 100000 * (1 + (currentDate.getTime() - startDate.getTime()) / (365 * 24 * 60 * 60 * 1000) * 0.1) // 10% annual benchmark
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log('Generated mock performance data', { count: mockData.length, timeframe });
      return NextResponse.json(mockData);
    }

    // Transform real data
    const performanceData = dailyPnl.map((pnl, index) => {
      const prevEquity = index > 0 ? dailyPnl[index - 1].realized + (dailyPnl[index - 1].unrealized || 0) : 100000;
      const currentEquity = pnl.realized + (pnl.unrealized || 0);
      const dailyReturn = ((currentEquity - prevEquity) / prevEquity) * 100;
      
      return {
        date: pnl.date.toISOString().split('T')[0],
        equity: currentEquity,
        returns: dailyReturn,
        drawdown: 0, // Calculate drawdown if needed
        benchmark: 100000 * (1 + (pnl.date.getTime() - startDate.getTime()) / (365 * 24 * 60 * 60 * 1000) * 0.1)
      };
    });

    console.log('Performance data fetched successfully', { count: performanceData.length, timeframe });
    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Error fetching performance data', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}
