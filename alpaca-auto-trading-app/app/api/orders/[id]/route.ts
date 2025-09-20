/**
 * File: app/api/orders/[id]/route.ts
 * Purpose: Individual order management (GET, DELETE) with proper error handling
 * Key dependencies: Next.js, axios, zod validation
 * Learning Angle: This demonstrates how to handle individual order operations
 * with proper error handling and status codes. Notice how we validate the
 * order ID and provide clear error messages for different scenarios.
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { z } from 'zod';
import { log } from '@/mw/log';

// Validation schema for order ID
const OrderIdSchema = z.string().uuid().or(z.string().min(1));

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = req.headers.get('x-request-id') || 'unknown';
  
  try {
    // Validate order ID
    const orderId = OrderIdSchema.parse(params.id);
    
    log.info({ requestId, orderId }, 'Fetching order details');

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

    // Fetch order from Alpaca
    const response = await axios.get(`${baseUrl}/orders/${orderId}`, {
      headers,
      timeout: 10000,
    });

    log.info({ 
      requestId, 
      orderId,
      status: response.data.status 
    }, 'Order details fetched successfully');

    return NextResponse.json({
      data: response.data,
      env: isLive ? 'live' : 'paper',
      success: true,
    });

  } catch (error: any) {
    log.error({ requestId, orderId: params.id, error: error.message }, 'Failed to fetch order');

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid order ID', details: 'Order ID must be a valid UUID or string' },
        { status: 400 }
      );
    }

    // Handle Axios errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      let message = 'Failed to fetch order';
      let details = errorData?.message || 'Unknown error';

      switch (status) {
        case 404:
          message = 'Order not found';
          details = 'The specified order does not exist';
          break;
        case 401:
          message = 'Authentication failed';
          details = 'Check your API credentials';
          break;
        case 403:
          message = 'Access denied';
          details = 'You do not have permission to access this order';
          break;
        default:
          message = 'Failed to fetch order';
      }

      return NextResponse.json(
        { error: message, details, status },
        { status: status >= 500 ? 500 : status }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = req.headers.get('x-request-id') || 'unknown';
  
  try {
    // Validate order ID
    const orderId = OrderIdSchema.parse(params.id);
    
    log.info({ requestId, orderId }, 'Cancelling order');

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

    // Cancel order in Alpaca
    const response = await axios.delete(`${baseUrl}/orders/${orderId}`, {
      headers,
      timeout: 10000,
    });

    log.info({ 
      requestId, 
      orderId,
      status: response.data.status 
    }, 'Order cancelled successfully');

    return NextResponse.json({
      data: response.data,
      env: isLive ? 'live' : 'paper',
      success: true,
    });

  } catch (error: any) {
    log.error({ requestId, orderId: params.id, error: error.message }, 'Failed to cancel order');

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid order ID', details: 'Order ID must be a valid UUID or string' },
        { status: 400 }
      );
    }

    // Handle Axios errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      let message = 'Failed to cancel order';
      let details = errorData?.message || 'Unknown error';

      switch (status) {
        case 404:
          message = 'Order not found';
          details = 'The specified order does not exist';
          break;
        case 400:
          message = 'Cannot cancel order';
          details = 'Order may already be filled, cancelled, or expired';
          break;
        case 401:
          message = 'Authentication failed';
          details = 'Check your API credentials';
          break;
        case 403:
          message = 'Access denied';
          details = 'You do not have permission to cancel this order';
          break;
        case 422:
          message = 'Order cannot be cancelled';
          details = 'Order is in a state that cannot be cancelled';
          break;
        default:
          message = 'Failed to cancel order';
      }

      return NextResponse.json(
        { error: message, details, status },
        { status: status >= 500 ? 500 : status }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
