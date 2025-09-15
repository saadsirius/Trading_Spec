import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // In a real app, you'd get the user ID from the session/auth
    const userId = 'demo-user';

    const trades = await prisma.tradeJournal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.tradeJournal.count({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      data: {
        trades,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error('Journal fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch trade journal' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tradeId, notes } = body;

    if (!tradeId || typeof notes !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data' 
        },
        { status: 400 }
      );
    }

    // In a real app, you'd get the user ID from the session/auth
    const userId = 'demo-user';

    const updatedTrade = await prisma.tradeJournal.update({
      where: { 
        id: tradeId,
        userId, // Ensure user can only update their own trades
      },
      data: { notes },
    });

    return NextResponse.json({
      success: true,
      data: updatedTrade,
    });
  } catch (error) {
    console.error('Journal update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update trade journal' 
      },
      { status: 500 }
    );
  }
}
