import { NextRequest } from 'next/server';
import { AlpacaEndpoints, alpacaGET, ZQuotesRequest } from '@/lib/api/alpaca';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    // Validate request parameters
    const parsed = ZQuotesRequest.safeParse({
      symbols: searchParams.get('symbols'),
      feed: searchParams.get('feed') || 'iex',
      start: searchParams.get('start'),
      end: searchParams.get('end'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      page_token: searchParams.get('page_token'),
    });
    
    if (!parsed.success) {
      return new Response(JSON.stringify({ 
        error: 'Invalid quotes request',
        details: parsed.error.flatten()
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Build query string
    const params = new URLSearchParams();
    Object.entries(parsed.data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const url = `${AlpacaEndpoints.quotes}?${params.toString()}`;
    const data = await alpacaGET(url);
    
    return Response.json(data);
    
  } catch (error) {
    console.error('Quotes GET error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch quotes data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
