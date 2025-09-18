import { http, HttpResponse } from 'msw';

export const alpacaHandlers = [
  // Bars: /api/alpaca/market/bars?symbols=SPY&timeframe=1Day&limit=300
  http.get('/api/alpaca/market/bars', ({ request }) => {
    const url = new URL(request.url);
    const symbols = (url.searchParams.get('symbols') || 'SPY').split(',');
    const makeBars = () => {
      const out: any[] = [];
      let p = 100;
      for (let i = 0; i < 300; i++) { 
        const d = (Math.random() - 0.48) * 0.8; 
        p = Math.max(1, p * (1 + d / 100)); 
        out.push({ 
          c: +p.toFixed(2), 
          h: p * 1.01, 
          l: p * 0.99, 
          t: Date.now() - (300 - i) * 86400000 
        }); 
      }
      return out;
    };
    const bars: Record<string, any[]> = {};
    symbols.forEach(s => bars[s] = makeBars());
    return HttpResponse.json({ bars });
  }),

  // Paper trade
  http.post('/api/alpaca/orders', async () => {
    return HttpResponse.json({ 
      id: 'mock-order', 
      status: 'accepted', 
      filled_qty: '0' 
    });
  }),
];
