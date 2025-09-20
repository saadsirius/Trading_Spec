import { prisma } from '@/src/server/db';
import { requireAdmin } from '@/src/server/admin/gate';

export async function GET() {
  const g = await requireAdmin(); if ('error' in g) return g.error;
  const cfg = await prisma.riskConfig.findFirst();
  return Response.json(cfg ?? {});
}

export async function POST(req: Request) {
  const g = await requireAdmin(); if ('error' in g) return g.error;
  const body = await req.json();
  const cfg = await prisma.riskConfig.upsert({
    where: { id: body.id ?? 'singleton' },
    update: body,
    create: { id: 'singleton', ...body },
  });
  return Response.json(cfg);
}
