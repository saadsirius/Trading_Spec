import { requireUser } from '@/src/server/apiGuard';

export async function requireAdmin() {
  const r = await requireUser({ role: ['ADMIN'] });
  if ('error' in r) return r; // NextResponse
  return r; // { user, apiKey }
}
