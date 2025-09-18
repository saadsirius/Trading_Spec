import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const side = searchParams.get('side');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

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
    if (symbol) params.append('symbols', symbol);
    if (dateFrom) params.append('start', dateFrom);
    if (dateTo) params.append('end', dateTo);
    params.append('limit', '1000');
    
    // Fetch trades from Alpaca
    const { data: alpacaTrades } = await axios.get(`${PAPER_BASE}/account/activities/trade?${params.toString()}`, { headers });
    
    // Filter by side if specified
    let filteredTrades = alpacaTrades;
    if (side) {
      filteredTrades = alpacaTrades.filter((trade: any) => trade.side === side);
    }
    
    // Transform Alpaca trades to match expected format
    const transformedTrades = filteredTrades.map((trade: any) => ({
      id: trade.id,
      symbol: trade.symbol,
      side: trade.side,
      qty: parseFloat(trade.qty),
      price: parseFloat(trade.price),
      filledAt: trade.created_at,
      strategyTag: trade.order_id ? `Order-${trade.order_id}` : undefined,
      pnl: trade.side === 'sell' ? parseFloat(trade.price) - parseFloat(trade.qty) : undefined // Simplified PnL calculation
    }));

    console.log('Trades fetched successfully from Alpaca', { count: transformedTrades.length, filters: { symbol, side, dateFrom, dateTo } });
    return NextResponse.json(transformedTrades);
  } catch (error) {
    console.error('Error fetching trades', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, side, qty, price, orderId } = body;

    // Validate required fields
    if (!symbol || !side || !qty || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, side, qty, price' },
        { status: 400 }
      );
    }

    // Create trade record
    const trade = await prisma.trade.create({
      data: {
        symbol,
        side,
        qty: parseFloat(qty),
        price: parseFloat(price),
        filledAt: new Date()
      }
    });

    console.log('Trade created successfully', { tradeId: trade.id, symbol, side, qty, price });
    return NextResponse.json(trade);
  } catch (error) {
    console.error('Error creating trade', error);
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 }
    );
  }
}
