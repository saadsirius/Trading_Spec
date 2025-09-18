import { list } from '@/src/plugins';

export async function GET() { 
  return Response.json({ items: list() }); 
}
