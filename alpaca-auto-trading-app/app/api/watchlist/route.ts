import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { WatchlistAction, WatchlistResponse, WatchItem } from '@/lib/types/overview';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/realtime';

const prisma = new PrismaClient();

const WatchlistActionSchema = z.object({
  action: z.enum(['add', 'remove']),
  symbol: z.string().min(1).max(10).toUpperCase(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = 'demo-user'; // In production, get from session
    
    // Rate limiting
    const rateLimitKey = `watchlist:${userId}`;
    const isAllowed = checkRateLimit(rateLimitKey, 60, 60000); // 60 req/min
    
    if (!isAllowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again later.'
        },
        { status: 429 }
      );
    }

    // Get user's watchlist
    const watchlistItems = await prisma.watchlistItem.findMany({
      where: {
        watchlist: {
          userId,
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

    const watchlist: WatchItem[] = [];

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

      watchlist.push({
        symbol: item.instrument.symbol,
        name: item.instrument.name,
        last: item.instrument.price,
        changePct: item.instrument.changePercent,
        spark,
      });
    }

    const response: WatchlistResponse = {
      success: true,
      watchlist,
    };

    const headers = {
      'Cache-Control': 'private, max-age=30',
      ...getRateLimitHeaders(rateLimitKey, 60, 60000),
    };

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('Error in GET /api/watchlist:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: 'Failed to fetch watchlist'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = 'demo-user'; // In production, get from session
    const body = await request.json();
    
    // Rate limiting
    const rateLimitKey = `watchlist:${userId}`;
    const isAllowed = checkRateLimit(rateLimitKey, 30, 60000); // 30 req/min
    
    if (!isAllowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again later.'
        },
        { status: 429 }
      );
    }

    // Validate request body
    const validatedData = WatchlistActionSchema.parse(body);
    const { action, symbol } = validatedData;

    // Check if instrument exists
    const instrument = await prisma.instrument.findUnique({
      where: { symbol },
      select: { id: true, symbol: true, name: true },
    });

    if (!instrument) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Instrument not found',
          details: `Symbol ${symbol} does not exist`
        },
        { status: 404 }
      );
    }

    // Get or create user's default watchlist
    let watchlist = await prisma.watchlist.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });

    if (!watchlist) {
      watchlist = await prisma.watchlist.create({
        data: {
          userId,
          name: 'My Watchlist',
          description: 'Default watchlist',
          isDefault: true,
        },
      });
    }

    if (action === 'add') {
      // Check if already in watchlist
      const existingItem = await prisma.watchlistItem.findUnique({
        where: {
          watchlistId_instrumentId: {
            watchlistId: watchlist.id,
            instrumentId: instrument.id,
          },
        },
      });

      if (existingItem) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Already in watchlist',
            details: `${symbol} is already in your watchlist`
          },
          { status: 409 }
        );
      }

      // Add to watchlist
      await prisma.watchlistItem.create({
        data: {
          watchlistId: watchlist.id,
          instrumentId: instrument.id,
        },
      });

      const response: WatchlistResponse = {
        success: true,
        watchlist: [], // Will be fetched by client
        message: `${symbol} added to watchlist`,
      };

      return NextResponse.json(response, { status: 201 });

    } else if (action === 'remove') {
      // Remove from watchlist
      const deleted = await prisma.watchlistItem.deleteMany({
        where: {
          watchlistId: watchlist.id,
          instrumentId: instrument.id,
        },
      });

      if (deleted.count === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Not in watchlist',
            details: `${symbol} is not in your watchlist`
          },
          { status: 404 }
        );
      }

      const response: WatchlistResponse = {
        success: true,
        watchlist: [], // Will be fetched by client
        message: `${symbol} removed from watchlist`,
      };

      return NextResponse.json(response);
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.errors.map(e => e.message).join(', ')
        },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/watchlist:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: 'Failed to update watchlist'
      },
      { status: 500 }
    );
  }
}
