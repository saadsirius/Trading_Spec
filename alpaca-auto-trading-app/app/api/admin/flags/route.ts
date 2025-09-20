import { prisma } from '@/src/server/db';
import { requireAdmin } from '@/src/server/admin/gate';

export async function GET() {
  const g = await requireAdmin(); if ('error' in g) return g.error;
  const rows = await prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  return Response.json(rows);
}

export async function POST(req: Request) {
  const g = await requireAdmin(); if ('error' in g) return g.error;
  const body = await req.json();
  const up = await prisma.featureFlag.upsert({
    where: { key: body.key },
    create: { key: body.key, enabled: !!body.enabled, meta: body.meta ?? {} },
    update: { enabled: !!body.enabled, meta: body.meta ?? {} },
  });
  return Response.json(up);
}
