import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const KEY_ID = process.env.APCA_API_KEY_ID;
    const SECRET = process.env.APCA_API_SECRET_KEY;
    const PAPER_BASE = process.env.APCA_PAPER_BASE_URL;
    
    return NextResponse.json({
      hasKeyId: !!KEY_ID,
      hasSecret: !!SECRET,
      keyIdLength: KEY_ID?.length || 0,
      secretLength: SECRET?.length || 0,
      keyIdPrefix: KEY_ID?.substring(0, 8) || 'N/A',
      secretPrefix: SECRET?.substring(0, 8) || 'N/A',
      paperBase: PAPER_BASE,
      allEnvVars: {
        APCA_API_KEY_ID: process.env.APCA_API_KEY_ID ? 'SET' : 'NOT SET',
        APCA_API_SECRET_KEY: process.env.APCA_API_SECRET_KEY ? 'SET' : 'NOT SET',
        APCA_PAPER_BASE_URL: process.env.APCA_PAPER_BASE_URL || 'NOT SET'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check environment' }, { status: 500 });
  }
}
