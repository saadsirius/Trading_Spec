import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return new Response('email_required', { status: 400 });
  const row = await prisma.user_profile.findUnique({ where: { email } });
  if (!row) return Response.json({ profile: null });
  const profile = {
    email: row.email,
    displayName: row.displayName ?? undefined,
    riskLevel: Math.max(1, Math.min(3, row.riskLevel)) as 1|2|3,
    horizonYears: row.horizonYears,
    incomeYear: row.incomeYear ?? undefined,
    savingsRate: row.savingsRate ?? undefined,
    goals: (row.goalsJson ?? []) as any[],
    holdings: (row.holdingsJson ?? []) as any[],
  };
  return Response.json({ profile });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.email) return new Response('email_required', { status: 400 });
  const data = {
    email: body.email,
    displayName: body.displayName ?? null,
    riskLevel: Math.max(1, Math.min(3, Number(body.riskLevel || 2))),
    horizonYears: Math.max(1, Number(body.horizonYears || 5)),
    incomeYear: body.incomeYear ?? null,
    savingsRate: body.savingsRate ?? null,
    goalsJson: body.goals ?? [],
    holdingsJson: body.holdings ?? [],
  };
  await prisma.user_profile.upsert({ where: { email: data.email }, create: data, update: data });
  return Response.json({ ok: true });
}
