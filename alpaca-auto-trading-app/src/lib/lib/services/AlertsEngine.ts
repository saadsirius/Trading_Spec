import { Symbol, UnixMs } from '@/types/market';
import { AiAlert, AlertKind } from '@/types/alerts';

export class AlertsEngine {
  private lastBySymbol = new Map<Symbol, UnixMs>(); // rate-limit
  private lastTriggeredPrice = new Map<Symbol, number>(); // hystérésis

  evaluateAi(alert: Omit<AiAlert,'actionable'>): AiAlert {
    const last = this.lastBySymbol.get(alert.symbol) ?? 0;
    const okRate = Date.now() - last > 15000; // 15s rate-limit
    const actionable = alert.confidence >= 0.6 && okRate && this.hysteresis(alert);
    
    if (actionable) {
      this.lastBySymbol.set(alert.symbol, Date.now());
      this.lastTriggeredPrice.set(alert.symbol, alert.price);
    }
    
    return { ...alert, actionable };
  }

  private hysteresis(a: Omit<AiAlert,'actionable'>): boolean {
    const lastPrice = this.lastTriggeredPrice.get(a.symbol);
    if (!lastPrice) return true;
    
    // Évite le ping-pong: ne redéclenche que si écart > 1%
    const threshold = lastPrice * 0.01;
    return Math.abs(a.price - lastPrice) > threshold;
  }

  // Simulation d'alertes IA pour les tests
  generateTestAlert(symbol: Symbol, kind: AlertKind, confidence: number = 0.75): AiAlert {
    const baseAlert = {
      id: crypto.randomUUID(),
      symbol,
      kind,
      confidence,
      price: 150 + Math.random() * 10,
      ts: Date.now(),
      reason: `AI detected ${kind} pattern`,
      featuresUsed: [`${kind.toUpperCase()} signal`, 'Volume confirmation'],
      sampleWindow: { from: Date.now() - 3600000, to: Date.now() }
    };

    return this.evaluateAi(baseAlert);
  }
}

export const alertsEngine = new AlertsEngine();
