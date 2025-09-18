import { NextRequest, NextResponse } from 'next/server';
import { ClickEvent } from '@/types/analytics';

export async function POST(req: NextRequest) {
  try {
    const events: ClickEvent[] = await req.json();
    
    // Validation basique
    if (!Array.isArray(events)) {
      return NextResponse.json({ error: 'Expected array of events' }, { status: 400 });
    }

    // Pour l'instant, on log les événements
    // TODO: Stocker en base de données ou envoyer à un service d'analytics
    console.log('[Analytics] Received events:', events.length);
    
    // Simulation de traitement
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({ ok: true, processed: events.length });
    
  } catch (e: any) {
    console.error('[Analytics] Error:', e);
    return NextResponse.json({ error: 'Failed to process analytics' }, { status: 500 });
  }
}
