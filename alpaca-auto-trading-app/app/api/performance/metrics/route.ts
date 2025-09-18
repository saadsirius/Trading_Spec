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
        startDate.setFullYear(2020);
        break;
    }

    // Fetch trades for metrics calculation
    const trades = await prisma.trade.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Calculate performance metrics
    const metrics = calculatePerformanceMetrics(trades, startDate, endDate);

    console.log('Performance metrics calculated successfully', { timeframe, tradesCount: trades.length });
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error calculating performance metrics', error);
    return NextResponse.json(
      { error: 'Failed to calculate performance metrics' },
      { status: 500 }
    );
  }
}

function calculatePerformanceMetrics(trades: any[], startDate: Date, endDate: Date) {
  // Mock calculation - in real implementation, use actual trade data
  const days = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const years = days / 365;

  // Simulate realistic performance metrics
  const totalReturn = (Math.random() - 0.3) * 50; // -15% to +35%
  const annualizedReturn = totalReturn / years;
  
  // Calculate Sharpe ratio (simplified)
  const riskFreeRate = 0.02; // 2% risk-free rate
  const volatility = 15 + Math.random() * 20; // 15-35% volatility
  const sharpeRatio = (annualizedReturn - riskFreeRate) / (volatility / 100);
  
  // Calculate other metrics
  const maxDrawdown = -(5 + Math.random() * 25); // -5% to -30%
  const winRate = 45 + Math.random() * 30; // 45-75%
  const profitFactor = 0.8 + Math.random() * 1.4; // 0.8-2.2
  const calmarRatio = annualizedReturn / Math.abs(maxDrawdown);

  return {
    totalReturn: totalReturn,
    annualizedReturn: annualizedReturn,
    sharpeRatio: sharpeRatio,
    maxDrawdown: maxDrawdown,
    winRate: winRate,
    profitFactor: profitFactor,
    volatility: volatility,
    calmarRatio: calmarRatio
  };
}
