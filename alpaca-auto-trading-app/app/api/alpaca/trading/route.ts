import { NextRequest } from 'next/server';
import { AlpacaEndpoints, alpacaGET, alpacaPOST, ZOrderRequest } from '@/lib/api/alpaca';
import { trackOrderSubmit, trackOrderError } from '@/lib/analytics/Analytics';
import { showError, showSuccess } from '@/lib/toast/ToastService';

export async function GET(req: NextRequest) {
  try {
    const action = req.nextUrl.searchParams.get('action');
    
    if (action === 'positions') {
      const data = await alpacaGET(AlpacaEndpoints.positions);
      return Response.json(data);
    }
    
    if (action === 'account') {
      const data = await alpacaGET(AlpacaEndpoints.account);
      return Response.json(data);
    }
    
    if (action === 'orders') {
      const status = req.nextUrl.searchParams.get('status');
      const limit = req.nextUrl.searchParams.get('limit') || '100';
      
      let url = AlpacaEndpoints.orders;
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('limit', limit);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const data = await alpacaGET(url);
      return Response.json(data);
    }
    
    return new Response(JSON.stringify({ 
      error: 'Unknown action. Supported actions: positions, account, orders' 
    }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Trading GET error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch trading data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = ZOrderRequest.safeParse(json);
    
    if (!parsed.success) {
      return new Response(JSON.stringify({ 
        error: 'Invalid order request',
        details: parsed.error.flatten()
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Track order submission
    trackOrderSubmit(parsed.data.symbol, parsed.data.side, Number(parsed.data.qty));
    
    const order = await alpacaPOST(AlpacaEndpoints.orders, parsed.data);
    
    // Show success toast
    showSuccess(
      'Order Submitted',
      `${parsed.data.side.toUpperCase()} ${parsed.data.qty} ${parsed.data.symbol}`
    );
    
    return Response.json(order);
    
  } catch (error) {
    console.error('Trading POST error:', error);
    
    // Track order error
    const symbol = req.body?.symbol || 'unknown';
    const message = error instanceof Error ? error.message : 'Unknown error';
    trackOrderError(symbol, message);
    
    // Show error toast
    showError('Order Failed', message);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to submit order',
      details: message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
