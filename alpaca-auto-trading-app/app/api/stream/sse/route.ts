import { NextRequest } from 'next/server';
import { StreamQ } from '@/src/mw/validate';

const BASE = process.env.NEXT_PUBLIC_BASE_URL || '';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  const { symbols } = StreamQ.parse(params);
  const syms = symbols.split(',').slice(0, 20);

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      
      async function tick() {
        try {
          const j = await fetch(
            `${BASE}/api/alpaca/market/bars?symbols=${syms.join(',')}&timeframe=1Min&limit=1`, 
            { cache: 'no-store' }
          ).then(r => r.json());
          
          const out: any = {}; 
          for (const s of syms) { 
            out[s] = j?.bars?.[s]?.[0]?.c ?? null; 
          }
          
          controller.enqueue(enc.encode(`event: quotes\ndata: ${JSON.stringify(out)}\n\n`));
          // Hook: messages IA (si tu pousses en Redis pub/sub, consomme ici)
        } catch { 
          controller.enqueue(enc.encode(`event: ping\ndata: {}\n\n`)); 
        }
      }
      
      const id = setInterval(tick, 2000); 
      await tick();
      
      // @ts-ignore
      controller._id = id;
    },
    cancel() { 
      // @ts-ignore 
      clearInterval((this as any)._id); 
    }
  });
  
  return new Response(stream, { 
    headers: { 
      'Content-Type': 'text/event-stream', 
      'Cache-Control': 'no-cache', 
      'Connection': 'keep-alive' 
    }
  });
}
