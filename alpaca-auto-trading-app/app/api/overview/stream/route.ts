import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'paper';

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = JSON.stringify({
        type: 'connected',
        mode,
        timestamp: new Date().toISOString()
      });
      controller.enqueue(`data: ${data}\n\n`);

      // Send periodic updates (every 5 seconds)
      const interval = setInterval(() => {
        const update = JSON.stringify({
          type: 'update',
          mode,
          timestamp: new Date().toISOString(),
          data: {
            // Mock data for now
            portfolioValue: 100000 + Math.random() * 10000,
            dayPnl: (Math.random() - 0.5) * 2000,
            positions: [
              { symbol: 'AAPL', qty: 100, price: 150 + Math.random() * 10 },
              { symbol: 'MSFT', qty: 50, price: 300 + Math.random() * 20 }
            ]
          }
        });
        controller.enqueue(`data: ${update}\n\n`);
      }, 5000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}