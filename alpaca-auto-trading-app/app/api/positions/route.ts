import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'paper';

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
    
    // Fetch positions from Alpaca
    const { data: alpacaPositions } = await axios.get(`${PAPER_BASE}/positions`, { headers });
    
    // Transform Alpaca positions to match expected format
    const transformedPositions = alpacaPositions.map((pos: any) => ({
      id: pos.asset_id,
      symbol: pos.symbol,
      qty: parseFloat(pos.qty),
      avgPrice: parseFloat(pos.avg_entry_price),
      marketPrice: parseFloat(pos.current_price),
      pnl: parseFloat(pos.unrealized_pl),
      pnlPct: parseFloat(pos.unrealized_plpc) * 100,
      sector: pos.asset_class || 'Unknown',
      updatedAt: new Date().toISOString()
    }));

    console.log('Positions fetched successfully from Alpaca', { mode, count: transformedPositions.length });
    return NextResponse.json(transformedPositions);
  } catch (error) {
    console.error('Error fetching positions', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}