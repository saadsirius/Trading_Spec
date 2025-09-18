import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashParams } from '@/lib/hash';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { day, entries, weights } = body || {};
    if (!Array.isArray(entries) || !day) return new Response('bad_request', { status: 400 });
    const paramsHash = hashParams(weights ?? {});
    // Upsert en lot (limiter à 300 pour éviter la tempête)
    const rows = (entries as any[]).slice(0, 300).map(e => ({
      day: new Date(day), symbol: e.symbol, score: e.score ?? 0,
      rsi: e.rsi ?? null, momentum: e.momentum ?? null, breakout: !!e.breakout,
      weightsJson: weights ?? {}, paramsHash,
    }));
    // Insert many (ignorer duplicats via params+symbol+day si tu ajoutes un unique)
    await prisma.ai_suggestions_daily.createMany({ data: rows, skipDuplicates: true });
    return Response.json({ ok: true, count: rows.length });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'persist_error' }), { status: 500 });
  }
}
