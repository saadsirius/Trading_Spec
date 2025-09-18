import { Symbol, UnixMs } from './market';

export type AlertKind = 'breakout'|'pullback'|'rsiReentry'|'emaCross'|'volSpike';

export interface AiAlert {
  id: string;
  symbol: Symbol;
  kind: AlertKind;
  confidence: number;          // 0..1
  price: number;
  ts: UnixMs;
  reason: string;              // phrase courte lisible
  featuresUsed: string[];      // e.g. ["EMA20>EMA50", "RSI(14) back to 50"]
  sampleWindow: { from: UnixMs; to: UnixMs };
  actionable: boolean;         // (confidence + rate-limit + hystérésis)
}

export interface UserAlertRule {
  id: string;
  symbol: Symbol;
  cond: { op: '>='|'<='|'crossUp'|'crossDown'; value: number };
  expiresAt?: UnixMs;
}
