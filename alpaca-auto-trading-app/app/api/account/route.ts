import { NextRequest, NextResponse } from 'next/server';
import { getAlpacaService } from '@/lib/alpaca/client';

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session/auth
    const userId = 'demo-user';
    const isLiveMode = false; // Default to paper trading

    const alpacaService = getAlpacaService(userId, isLiveMode);
    const account = await alpacaService.getAccount();

    return NextResponse.json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error('Account fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch account information' 
      },
      { status: 500 }
    );
  }
}
