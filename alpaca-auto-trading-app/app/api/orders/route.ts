import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');

    const PAPER_BASE = process.env.APCA_PAPER_BASE_URL || "https://paper-api.alpaca.markets/v2";
    const KEY_ID = process.env.APCA_API_KEY_ID;
    const SECRET = process.env.APCA_API_SECRET_KEY;
    
    if (!KEY_ID || !SECRET) {
      return NextResponse.json(
        { error: 'Alpaca API keys not configured' },
        { status: 500 }
      );
    }
    
    const headers = {
      "APCA-API-KEY-ID": KEY_ID,
      "APCA-API-SECRET-KEY": SECRET,
      "Content-Type": "application/json",
    };
    
    // Build query parameters for Alpaca API
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', '100');
    
    let url = `${PAPER_BASE}/orders`;
    if (id) {
      url = `${PAPER_BASE}/orders/${id}`;
    } else {
      url += `?${params.toString()}`;
    }
    
    // Fetch orders from Alpaca
    const { data: alpacaOrders } = await axios.get(url, { headers });
    
    // Handle single order vs array of orders
    const orders = Array.isArray(alpacaOrders) ? alpacaOrders : [alpacaOrders];
    
    // Transform Alpaca orders to match expected format
    const transformedOrders = orders.map((order: any) => ({
      id: order.id,
      symbol: order.symbol,
      side: order.side,
      qty: parseFloat(order.qty),
      price: order.limit_price ? parseFloat(order.limit_price) : parseFloat(order.filled_avg_price || 0),
      status: order.status,
      type: order.order_type,
      createdAt: order.created_at,
      filledAt: order.filled_at,
      submittedAt: order.submitted_at,
      updatedAt: order.updated_at
    }));

    console.log('Orders fetched successfully from Alpaca', { count: transformedOrders.length });
    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, side, qty, type = 'market', limit_price, stop_price, time_in_force = 'day' } = body;

    // Validate required fields
    if (!symbol || !side || !qty) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, side, qty' },
        { status: 400 }
      );
    }

    const PAPER_BASE = process.env.APCA_PAPER_BASE_URL || "https://paper-api.alpaca.markets/v2";
    const KEY_ID = process.env.APCA_API_KEY_ID;
    const SECRET = process.env.APCA_API_SECRET_KEY;
    
    if (!KEY_ID || !SECRET) {
      return NextResponse.json(
        { error: 'Alpaca API keys not configured' },
        { status: 500 }
      );
    }
    
    const headers = {
      "APCA-API-KEY-ID": KEY_ID,
      "APCA-API-SECRET-KEY": SECRET,
      "Content-Type": "application/json",
    };
    
    // Build order payload for Alpaca
    const orderPayload: any = {
      symbol,
      qty: qty.toString(),
      side,
      type,
      time_in_force
    };
    
    if (limit_price) {
      orderPayload.limit_price = limit_price.toString();
    }
    
    if (stop_price) {
      orderPayload.stop_price = stop_price.toString();
    }
    
    // Place order with Alpaca
    const { data: alpacaOrder } = await axios.post(`${PAPER_BASE}/orders`, orderPayload, { headers });
    
    // Transform Alpaca order response to match expected format
    const transformedOrder = {
      id: alpacaOrder.id,
      symbol: alpacaOrder.symbol,
      side: alpacaOrder.side,
      qty: parseFloat(alpacaOrder.qty),
      price: alpacaOrder.limit_price ? parseFloat(alpacaOrder.limit_price) : parseFloat(alpacaOrder.filled_avg_price || 0),
      status: alpacaOrder.status,
      type: alpacaOrder.order_type,
      createdAt: alpacaOrder.created_at,
      filledAt: alpacaOrder.filled_at,
      submittedAt: alpacaOrder.submitted_at,
      updatedAt: alpacaOrder.updated_at
    };

    console.log('Order placed successfully with Alpaca', { orderId: transformedOrder.id, symbol, side, qty });
    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error('Error placing order', error);
    return NextResponse.json(
      { error: 'Failed to place order' },
      { status: 500 }
    );
  }
}