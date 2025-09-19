import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

export interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface WebVitalsConfig {
  reportAllChanges?: boolean;
  debug?: boolean;
  endpoint?: string;
  sampleRate?: number;
}

class WebVitalsMonitor {
  private config: WebVitalsConfig;
  private metrics: WebVitalsMetric[] = [];
  private isEnabled: boolean = true;

  constructor(config: WebVitalsConfig = {}) {
    this.config = {
      reportAllChanges: false,
      debug: process.env.NODE_ENV === 'development',
      endpoint: '/api/analytics/web-vitals',
      sampleRate: 1.0,
      ...config
    };
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      CLS: { good: 0.1, poor: 0.25 },
      INP: { good: 200, poor: 500 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[name];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private async reportMetric(metric: any) {
    if (!this.isEnabled) return;

    const webVitalsMetric: WebVitalsMetric = {
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      rating: this.getRating(metric.name, metric.value),
      timestamp: Date.now()
    };

    this.metrics.push(webVitalsMetric);

    if (this.config.debug) {
      console.log(`[Web Vitals] ${metric.name}:`, webVitalsMetric);
    }

    // Send to analytics endpoint
    if (this.config.endpoint && Math.random() < (this.config.sampleRate || 1.0)) {
      try {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webVitalsMetric),
        });
      } catch (error) {
        if (this.config.debug) {
          console.error('[Web Vitals] Failed to report metric:', error);
        }
      }
    }
  }

  public start() {
    if (typeof window === 'undefined') return;

    onCLS(this.reportMetric.bind(this));
    onINP(this.reportMetric.bind(this));
    onFCP(this.reportMetric.bind(this));
    onLCP(this.reportMetric.bind(this));
    onTTFB(this.reportMetric.bind(this));

    if (this.config.debug) {
      console.log('[Web Vitals] Monitoring started');
    }
  }

  public stop() {
    this.isEnabled = false;
    if (this.config.debug) {
      console.log('[Web Vitals] Monitoring stopped');
    }
  }

  public getMetrics(): WebVitalsMetric[] {
    return [...this.metrics];
  }

  public getLatestMetric(name: string): WebVitalsMetric | undefined {
    return this.metrics
      .filter(m => m.name === name)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
  }

  public getAverageMetric(name: string): number {
    const metrics = this.metrics.filter(m => m.name === name);
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  }

  public getScore(): { overall: number; breakdown: Record<string, number> } {
    const breakdown: Record<string, number> = {};
    let totalScore = 0;
    let metricCount = 0;

    ['CLS', 'INP', 'FCP', 'LCP', 'TTFB'].forEach(name => {
      const latest = this.getLatestMetric(name);
      if (latest) {
        const score = latest.rating === 'good' ? 100 : latest.rating === 'needs-improvement' ? 50 : 0;
        breakdown[name] = score;
        totalScore += score;
        metricCount++;
      }
    });

    return {
      overall: metricCount > 0 ? totalScore / metricCount : 0,
      breakdown
    };
  }
}

// Global instance
export const webVitals = new WebVitalsMonitor({
  debug: process.env.NODE_ENV === 'development',
  sampleRate: 0.1 // 10% sampling in production
});

// Auto-start in browser
if (typeof window !== 'undefined') {
  webVitals.start();
}

export default webVitals;
