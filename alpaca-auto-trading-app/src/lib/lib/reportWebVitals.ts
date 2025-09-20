/**
 * File: lib/reportWebVitals.ts
 * Description: Report Next.js Core Web Vitals to an endpoint (default /api/metrics).
 *
 * Usage (client): call initWebVitalsReporting() once, e.g. in app/layout.tsx:
 *   useEffect(() => initWebVitalsReporting('/api/metrics'), []);
 */
import type { ReportHandler } from 'web-vitals';

export function initWebVitalsReporting(endpoint = '/api/metrics') {
  if (typeof window === 'undefined') return;

  // Lazy import to avoid adding to main bundle
  import('web-vitals').then(({ onCLS, onFCP, onFID, onLCP, onTTFB, onINP }) => {
    const send: ReportHandler = (metric) => {
      try {
        navigator.sendBeacon?.(
          endpoint,
          JSON.stringify({
            name: metric.name,
            value: metric.value,
            id: metric.id,
            delta: (metric as any).delta ?? undefined,
            rating: (metric as any).rating ?? undefined,
            page: location.pathname,
            ts: Date.now()
          })
        );
      } catch {
        // fallback
        fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          keepalive: true,
          body: JSON.stringify({ ...metric, page: location.pathname, ts: Date.now() })
        }).catch(() => {});
      }
    };

    onCLS(send);
    onFCP(send);
    onFID(send);
    onLCP(send);
    onTTFB(send);
    onINP?.(send);
  });
}
