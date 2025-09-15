import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OverviewAggregator } from '@/lib/overview';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/realtime';

const ModeSchema = z.enum(['paper', 'live']);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modeParam = searchParams.get('mode');
    
    // Validate mode parameter
    const modeResult = ModeSchema.safeParse(modeParam);
    if (!modeResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid mode parameter', 
          details: 'Mode must be "paper" or "live"' 
        },
        { status: 400 }
      );
    }

    const mode = modeResult.data;
    
    // For demo purposes, using a static user ID
    // In production, this would come from session/auth
    const userId = 'demo-user';
    
    // Rate limiting
    const rateLimitKey = `overview:${userId}:${mode}`;
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

    // Live mode security check
    if (mode === 'live') {
      // In production, check user.liveEnabled from database
      // For now, allowing live mode for demo
    }

    // Aggregate overview data
    const aggregator = new OverviewAggregator(userId, mode);
    const overviewData = await aggregator.getOverviewData();

    const headers = {
      'Cache-Control': 'private, max-age=5, s-maxage=5',
      'Surrogate-Key': `overview:user:${userId}:${mode}`,
      ...getRateLimitHeaders(rateLimitKey, 30, 60000),
    };

    return NextResponse.json({
      success: true,
      data: overviewData,
    }, { headers });

  } catch (error) {
    console.error('Error in /api/overview:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: 'Failed to fetch overview data'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed' 
    },
    { status: 405 }
  );
}
