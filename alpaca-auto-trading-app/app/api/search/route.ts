import { NextRequest } from 'next/server';
import { searchAll } from '@/lib/search/engine';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  if (!q) return Response.json({ items: [] });
  
  const items = await searchAll(q);
  return Response.json({ items });
}
