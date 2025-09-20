/**
 * File: app/api/positions/route.ts
 * Purpose: Alpaca positions API proxy with proper error handling
 * Key dependencies: Next.js, axios
 * Learning Angle: This demonstrates how to create a simple API proxy for
 * fetching positions data. Notice how we handle different environments
 * and provide consistent error responses.
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { log } from '@/mw/log';

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || 'unknown';
  
  try {
    log.info({ requestId }, 'Fetching positions');

    // Get environment configuration
    const isLive = req.nextUrl.searchParams.get('env') === 'live';
    const baseUrl = isLive 
      ? process.env.APCA_LIVE_BASE_URL || 'https://api.alpaca.markets/v2'
      : process.env.APCA_PAPER_BASE_URL || 'https://paper-api.alpaca.markets/v2';
    
    const apiKey = process.env.APCA_API_KEY_ID;
    const secretKey = process.env.APCA_API_SECRET_KEY;

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Prepare headers
    const headers = {
      'APCA-API-KEY-ID': apiKey,
      'APCA-API-SECRET-KEY': secretKey,
    };

    // Fetch positions from Alpaca
    const response = await axios.get(`${baseUrl}/positions`, {
      headers,
      timeout: 10000,
    });

    log.info({ 
      requestId, 
      count: response.data.length 
    }, 'Positions fetched successfully');

    return NextResponse.json({
      data: response.data,
      env: isLive ? 'live' : 'paper',
      success: true,
    });

  } catch (error: any) {
    log.error({ requestId, error: error.message }, 'Failed to fetch positions');

    if (error.response) {
      return NextResponse.json(
        { error: 'Failed to fetch positions', details: error.response.data?.message },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}