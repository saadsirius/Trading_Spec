import { NextRequest } from 'next/server';
import { suggestions } from '@/lib/search/engine';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  if (!q) return Response.json({ items: [] });
  
  const items = await suggestions(q);
  return Response.json({ items });
}
