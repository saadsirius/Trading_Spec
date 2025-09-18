import { ClickEvent } from '@/types/analytics';

export class AnalyticsService {
  private queue: ClickEvent[] = [];

  track(action: string, meta?: ClickEvent['meta']) {
    this.queue.push({ 
      id: crypto.randomUUID(), 
      action, 
      ts: Date.now(), 
      meta 
    });
    
    if (this.queue.length >= 20) {
      this.flush();
    }
  }

  async flush() { 
    if (!this.queue.length) return;
    
    const batch = this.queue.splice(0, this.queue.length);
    
    try {
      await fetch('/api/analytics', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch) 
      });
    } catch (e) {
      console.warn('[AnalyticsService] Flush failed:', e);
      // Re-queue failed events
      this.queue.unshift(...batch);
    }
  }

  // Auto-flush every 30 seconds
  startAutoFlush() {
    setInterval(() => this.flush(), 30000);
  }
}

export const analytics = new AnalyticsService();
