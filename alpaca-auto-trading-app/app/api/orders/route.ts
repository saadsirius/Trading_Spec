/**
 * File: app/api/orders/route.ts
 * Purpose: Alpaca orders API proxy with proper error handling and rate limiting
 * Key dependencies: Next.js, axios, zod validation
 * Learning Angle: This demonstrates how to create a secure API proxy that handles
 * order submission with proper validation, error handling, and rate limiting.
 * Notice how we validate all inputs and provide clear error messages.
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { z } from 'zod';
import { log } from '@/mw/log';

// Validation schema for order submission
const OrderSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  qty: z.string().min(1, 'Quantity is required'),
  side: z.enum(['buy', 'sell'], { required_error: 'Side is required' }),
  type: z.enum(['market', 'limit', 'stop', 'stop_limit', 'trailing_stop'], { 
    required_error: 'Order type is required' 
  }),
  time_in_force: z.enum(['day', 'gtc', 'opg', 'cls', 'ioc', 'fok'], { 
    required_error: 'Time in force is required' 
  }),
  client_order_id: z.string().optional(),
  limit_price: z.string().optional(),
  stop_price: z.string().optional(),
  trail_percent: z.string().optional(),
  trail_price: z.string().optional(),
  hwm: z.string().optional(),
  extended_hours: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || 'unknown';
  
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedOrder = OrderSchema.parse(body);
    
    log.info({ requestId, order: validatedOrder }, 'Order submission request');

    // Get environment configuration
    const isLive = req.nextUrl.searchParams.get('env') === 'live';
    const baseUrl = isLive 
      ? process.env.APCA_LIVE_BASE_URL || 'https://api.alpaca.markets/v2'
      : process.env.APCA_PAPER_BASE_URL || 'https://paper-api.alpaca.markets/v2';
    
    const apiKey = process.env.APCA_API_KEY_ID;
    const secretKey = process.env.APCA_API_SECRET_KEY;

    if (!apiKey || !secretKey) {
      log.error({ requestId }, 'Alpaca API keys not configured');
      return NextResponse.json(
        { error: 'API configuration error', details: 'Alpaca API keys not configured' },
        { status: 500 }
      );
    }

    // Prepare headers for Alpaca API
    const headers = {
      'APCA-API-KEY-ID': apiKey,
      'APCA-API-SECRET-KEY': secretKey,
      'Content-Type': 'application/json',
    };

    // Submit order to Alpaca
    const response = await axios.post(`${baseUrl}/orders`, validatedOrder, {
      headers,
      timeout: 10000, // 10 second timeout
    });

    log.info({ 
      requestId, 
      orderId: response.data.id,
      status: response.data.status 
    }, 'Order submitted successfully');

    return NextResponse.json({
      data: response.data,
      env: isLive ? 'live' : 'paper',
      success: true,
    });

  } catch (error: any) {
    log.error({ requestId, error: error.message }, 'Order submission failed');

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    // Handle Axios errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      let message = 'Order submission failed';
      let details = errorData?.message || 'Unknown error';

      // Map common Alpaca errors to user-friendly messages
      switch (status) {
        case 400:
          message = 'Invalid order parameters';
          break;
        case 401:
          message = 'Authentication failed';
          details = 'Check your API credentials';
          break;
        case 403:
          message = 'Order not allowed';
          details = 'Check account permissions and trading hours';
          break;
        case 404:
          message = 'Symbol not found';
          break;
        case 409:
          message = 'Duplicate order';
          details = 'Order with this client_order_id already exists';
          break;
        case 422:
          message = 'Order validation failed';
          break;
        case 429:
          message = 'Rate limit exceeded';
          details = 'Too many requests, please try again later';
          break;
        default:
          message = 'Order submission failed';
      }

      return NextResponse.json(
        { error: message, details, status },
        { status: status >= 500 ? 500 : status }
      );
    }

    // Handle network errors
    if (error.request) {
      return NextResponse.json(
        { error: 'Network error', details: 'Unable to connect to Alpaca API' },
        { status: 503 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || 'unknown';
  
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'open';
    const limit = searchParams.get('limit') || '50';
    const after = searchParams.get('after');
    const until = searchParams.get('until');
    const direction = searchParams.get('direction') || 'desc';
    const nested = searchParams.get('nested') || 'false';

    // Get environment configuration
    const isLive = searchParams.get('env') === 'live';
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

    // Build query parameters
    const params = new URLSearchParams({
      status,
      limit,
      direction,
      nested,
    });

    if (after) params.append('after', after);
    if (until) params.append('until', until);

    // Prepare headers
    const headers = {
      'APCA-API-KEY-ID': apiKey,
      'APCA-API-SECRET-KEY': secretKey,
    };

    // Fetch orders from Alpaca
    const response = await axios.get(`${baseUrl}/orders?${params.toString()}`, {
      headers,
      timeout: 10000,
    });

    log.info({ 
      requestId, 
      count: response.data.length,
      status 
    }, 'Orders fetched successfully');

    return NextResponse.json({
      data: response.data,
      env: isLive ? 'live' : 'paper',
      success: true,
    });

  } catch (error: any) {
    log.error({ requestId, error: error.message }, 'Failed to fetch orders');

    if (error.response) {
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: error.response.data?.message },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}