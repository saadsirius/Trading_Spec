import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/core/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Fetch PnL data from database
    const pnlData = await prisma.pnLDay.findMany({
      orderBy: { date: 'desc' },
      take: days
    });

    // If no data in database, return mock data
    if (pnlData.length === 0) {
      const mockData = [];
      const today = new Date();
      let equity = 100000; // Starting equity
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Simulate some daily variation
        const dailyReturn = (Math.random() - 0.5) * 0.05; // -2.5% to +2.5%
        equity = equity * (1 + dailyReturn);
        
        mockData.push({
          date: date.toISOString().split('T')[0],
          equity: Math.round(equity),
          realized: Math.round((Math.random() - 0.5) * 1000), // Random realized PnL
          unrealized: Math.round((Math.random() - 0.5) * 2000) // Random unrealized PnL
        });
      }

      console.log('PnL data fetched successfully (mock data)', { count: mockData.length });
      return NextResponse.json(mockData);
    }

    // Transform database data to match expected format
    const transformedData = pnlData.map(pnl => ({
      date: pnl.date.toISOString().split('T')[0],
      equity: 100000 + pnl.realized + (pnl.unrealized || 0), // Mock equity calculation
      realized: pnl.realized,
      unrealized: pnl.unrealized || 0
    }));

    console.log('PnL data fetched successfully', { count: transformedData.length });
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching PnL data', error);
    return NextResponse.json(
      { error: 'Failed to fetch PnL data' },
      { status: 500 }
    );
  }
}