import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, symbol, action, score, decision, context } = body ?? {};
  if (!email || !symbol || !action || !decision) return new Response('bad_request', { status: 400 });
  await prisma.advisor_feedback.create({
    data: {
      userEmail: email, symbol, action, score: Number(score ?? 0), decision, contextJson: context ?? {},
    }
  });
  return Response.json({ ok: true });
}
