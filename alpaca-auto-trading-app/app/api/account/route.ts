import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const PAPER_BASE = process.env.APCA_PAPER_BASE_URL || "https://paper-api.alpaca.markets/v2";
    const KEY_ID = process.env.APCA_API_KEY_ID;
    const SECRET = process.env.APCA_API_SECRET_KEY;
    
    console.log('Environment check:', {
      hasKeyId: !!KEY_ID,
      hasSecret: !!SECRET,
      keyIdLength: KEY_ID?.length || 0,
      secretLength: SECRET?.length || 0,
      paperBase: PAPER_BASE
    });
    
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
    
    const { data: account } = await axios.get(`${PAPER_BASE}/account`, { headers });
    
    console.log('Account information fetched successfully from Alpaca');
    return NextResponse.json(account);
  } catch (error: any) {
    console.error('Error fetching account', error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('Alpaca API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response received from Alpaca API:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch account information',
        details: error.response?.data || error.message,
        status: error.response?.status
      },
      { status: 500 }
    );
  }
}