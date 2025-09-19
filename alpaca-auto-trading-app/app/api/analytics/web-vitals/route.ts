import { NextRequest } from 'next/server';
import { log } from '@/mw/log';

export async function POST(req: NextRequest) {
  try {
    const metric = await req.json();
    
    // Log the metric
    log.info({
      type: 'web-vitals',
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      userAgent: req.headers.get('user-agent'),
      url: req.headers.get('referer')
    }, 'Web Vitals metric received');

    // In a real application, you would:
    // 1. Store in database
    // 2. Send to analytics service (Google Analytics, Mixpanel, etc.)
    // 3. Alert if metrics are poor
    // 4. Aggregate for reporting

    return Response.json({ success: true });
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to process web vitals metric');
    return Response.json({ error: 'Failed to process metric' }, { status: 500 });
  }
}
