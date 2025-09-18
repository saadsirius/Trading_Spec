import { NextRequest } from 'next/server';
import { log, getReqId } from '@/mw/log';
import { rateLimit } from '@/lib/rate/limiter';
import { register, resolve } from '@/plugins';
import { alpacaProvider } from '@/plugins/alpaca';
import { aiProvider } from '@/plugins/ai';

register(alpacaProvider);
register(aiProvider);

export const runtime = 'nodejs';

export async function ALL(req: NextRequest, { params }: { params: { path: string[] } }) {
  const id = getReqId(req.headers);
  const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? '0.0.0.0';
  
  if (!(await rateLimit(String(ip)))) {
    return new Response('Rate limit', { status: 429 });
  }

  const pathname = '/' + (params.path || []).join('/');
  const seg0 = pathname.split('/')[1];
  const plugin = resolve(pathname.replace(`/${seg0}`, ''));

  log.info({ id, pathname, ip, plugin: plugin?.id }, 'Gateway hit');
  
  if (!plugin) {
    return new Response('No provider', { status: 404 });
  }

  try {
    return await plugin.exec(req as unknown as Request);
  } catch (e: any) {
    log.error({ id, err: e?.message }, 'Gateway error');
    return new Response('GW error', { status: 500 });
  }
}

// Next exige des handlers explicites
export const GET = ALL;
export const POST = ALL;
export const PUT = ALL;
export const DELETE = ALL;
