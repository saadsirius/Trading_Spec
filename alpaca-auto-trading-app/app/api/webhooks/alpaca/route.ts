import { verifyHmac } from '@/src/mw/validate';

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = (req.headers.get('x-signature') || '').trim();
  
  if (!verifyHmac(raw, sig)) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  // TODO: traiter l'événement (ordre, fill, etc.) puis invalider caches ciblés
  return new Response('ok');
}
