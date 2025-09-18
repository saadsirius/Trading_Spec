import type { AnalyticsEvent } from '@/types';

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private readonly maxEvents = 1000;
  private readonly flushInterval = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startFlushTimer();
  }

  track(event: AnalyticsEvent): void {
    // Add to local buffer
    this.events.push({
      ...event,
      timestamp: Date.now(),
    } as AnalyticsEvent & { timestamp: number });

    // Prevent memory leaks
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Immediate flush for critical events
    if (event.type === 'order_error' || event.type === 'alert_fired') {
      this.flush();
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // In a real implementation, you would send to your analytics service
      // For now, we'll just log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Events:', eventsToFlush);
      }

      // Example: Send to analytics service
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events: eventsToFlush }),
      // });
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-add events to buffer on failure
      this.events.unshift(...eventsToFlush);
    }
  }

  // Public method to manually flush
  async forceFlush(): Promise<void> {
    await this.flush();
  }

  // Get current event count
  getEventCount(): number {
    return this.events.length;
  }

  // Cleanup
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// Simple Analytics object for compatibility
export const Analytics = {
  emit(evt: AnalyticsEvent) { analytics.track(evt); }
};

// Helper functions for common events
export const trackOrderSubmit = (symbol: string, side: 'buy' | 'sell', qty: number) => {
  analytics.track({ type: 'order_submit', symbol, side, qty });
};

export const trackOrderError = (symbol: string, message: string) => {
  analytics.track({ type: 'order_error', symbol, message });
};

export const trackAlertFired = (symbol: string, score: number, rule: string) => {
  analytics.track({ type: 'alert_fired', symbol, score, rule });
};

export const trackChartInteraction = (action: 'crosshair' | 'timeframe_change') => {
  analytics.track({ type: 'chart_interaction', action });
};
