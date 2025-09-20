/**
 * File: src/types/analytics.d.ts
 * Description: Analytics and metrics types.
 */
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
  navigationType: 'navigate' | 'reload' | 'back_forward' | 'prerender';
  rating?: 'good' | 'needs-improvement' | 'poor';
}

export interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  cls: number;
  inp: number;
  ttfb: number;
}
