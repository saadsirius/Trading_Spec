import { list } from '@/plugins';

export async function GET() { 
  return Response.json({ items: list() }); 
}
