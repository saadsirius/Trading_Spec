import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, minRoi = 0.02, symbols = ['SPY', 'QQQ'] } = await req.json() || {};
  const out: any[] = [];
  
  for (const s of symbols) {
    const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/roi/evaluate`, { 
      method: 'POST', 
      headers: { 'content-type': 'application/json' }, 
      body: JSON.stringify({ email, symbol: s }) 
    }).then(r => r.json());
    
    if ((r.expRoi || 0) >= minRoi) {
      out.push({ 
        symbol: s, 
        reason: `ROI attendu ${(r.expRoi * 100).toFixed(1)}% >= ${(minRoi * 100).toFixed(1)}%`, 
        expl: r 
      });
    }
  }
  
  return Response.json({ fired: out });
}
