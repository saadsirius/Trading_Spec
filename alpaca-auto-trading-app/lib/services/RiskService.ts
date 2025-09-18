import { PlaceOrderPayload } from '@/types/orders';

export interface RiskLimits {
  maxDailyLoss: number;       // € absolu
  maxPositionSizePct: number; // % du capital
  maxOrdersPerMinute: number;
  pauseAfterNFailures: number;
}

export class RiskService {
  private state = { 
    dailyPnl: 0, 
    failures: 0, 
    lastMinuteCount: 0, 
    pausedUntil: 0,
    lastMinuteReset: Date.now()
  };

  canPlaceOrder(payload: PlaceOrderPayload, equity: number, limits: RiskLimits): { ok: boolean; reason?: string } {
    const now = Date.now();
    
    // Reset minute counter if needed
    if (now - this.state.lastMinuteReset > 60000) {
      this.state.lastMinuteCount = 0;
      this.state.lastMinuteReset = now;
    }

    if (now < this.state.pausedUntil) {
      return { ok: false, reason: 'paused' };
    }
    
    if (this.state.dailyPnl <= -limits.maxDailyLoss) {
      return { ok: false, reason: 'maxDailyLoss' };
    }
    
    const positionValue = payload.qty * (payload.limitPrice ?? 0);
    if (positionValue > equity * limits.maxPositionSizePct) {
      return { ok: false, reason: 'size' };
    }

    if (this.state.lastMinuteCount >= limits.maxOrdersPerMinute) {
      return { ok: false, reason: 'rateLimit' };
    }

    return { ok: true };
  }

  recordOrder() {
    this.state.lastMinuteCount++;
  }

  recordFailure(limits: RiskLimits) {
    this.state.failures += 1;
    if (this.state.failures >= limits.pauseAfterNFailures) {
      this.state.pausedUntil = Date.now() + 5 * 60_000; // 5 minutes
    }
  }

  recordSuccess() {
    this.state.failures = Math.max(0, this.state.failures - 1);
  }

  updateDailyPnl(pnl: number) {
    this.state.dailyPnl = pnl;
  }

  getState() {
    return { ...this.state };
  }
}

export const risk = new RiskService();
