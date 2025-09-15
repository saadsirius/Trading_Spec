import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSSEStream, getSSEHeaders, checkRateLimit } from '@/lib/realtime';
import { SSEEvent } from '@/lib/types/overview';

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
    const userId = 'demo-user';
    
    // Rate limiting for SSE connections (max 1 per user per mode)
    const rateLimitKey = `sse:${userId}:${mode}`;
    const isAllowed = checkRateLimit(rateLimitKey, 1, 60000); // 1 connection per minute
    
    if (!isAllowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Connection limit exceeded',
          details: 'Only one SSE connection allowed per user per mode'
        },
        { status: 429 }
      );
    }

    // Live mode security check
    if (mode === 'live') {
      // In production, check user.liveEnabled from database
    }

    // Create SSE stream
    const stream = createSSEStream(userId, mode);
    
    // Simulate some mock updates for demo
    // In production, this would be triggered by real Alpaca WebSocket events
    setTimeout(() => {
      const mockKPIUpdate: SSEEvent = {
        type: 'KPI_UPDATE',
        data: {
          equity: 10025.42,
          cash: 2011.77,
          dayPnL: 35.21,
        }
      };
      
      // Broadcast would be called from Alpaca WebSocket handlers
      // broadcastToUser(userId, mode, mockKPIUpdate);
    }, 5000);

    return new NextResponse(stream, {
      headers: getSSEHeaders(),
    });

  } catch (error) {
    console.error('Error in /api/overview/stream:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: 'Failed to establish SSE connection'
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
