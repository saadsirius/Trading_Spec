import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { alpacaTrade } from '@/lib/api/alpaca';

export async function POST(req: NextRequest) {
  const { email, action, payload } = await req.json() || {};
  if (!email || !action) return new Response('bad_request', { status: 400 });
  
  const auth = await prisma.ai_authorization.findFirst({ 
    where: { userEmail: email, scope: action } 
  });
  const level = auth?.level ?? 0; // 0=off, 1=ask, 2=auto
  
  // journaliser l'intention même si non exécutée
  // NB: tu peux créer une table ai_actions_log si besoin
  if (level === 0) return Response.json({ executed: false, reason: 'not_authorized' });
  if (level === 1) return Response.json({ executed: false, reason: 'needs_confirmation' });
  
  // level 2 → exécution simulée (paper)
  if (action === 'orders.place') {
    const res = await alpacaTrade('/v2/orders', { 
      method: 'POST', 
      body: JSON.stringify({
        symbol: payload?.symbol, 
        side: payload?.side ?? 'buy', 
        qty: payload?.qty ?? 1, 
        type: 'market', 
        time_in_force: 'day'
      })
    }).catch(e => ({ error: String(e) }));
    return Response.json({ executed: true, res });
  }
  
  if (action === 'rebalance.auto') {
    // placeholder: calculer deltas, envoyer plusieurs ordres paper
    return Response.json({ executed: true, res: 'rebalance_simulated' });
  }
  
  return Response.json({ executed: false, reason: 'unknown_action' });
}
