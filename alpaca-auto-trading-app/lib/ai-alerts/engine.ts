import { AIAlert, AITradeSuggestion } from './types';

const queue: AIAlert[] = [];
let lastActionableBySymbol = new Map<string, number>();

function now() { return Date.now(); }

export function pushAISuggestion(s: AIAlert) {
  // rate-limit actionable alerts: 1 per symbol / 15s
  const key = s.symbol;
  const last = lastActionableBySymbol.get(key) ?? 0;
  if (s.kind === 'AI_TRADE_SUGGESTION' && now() - last < 15000) return;
  if (s.kind === 'AI_TRADE_SUGGESTION') lastActionableBySymbol.set(key, now());

  // confidence gate
  if ('confidence' in s && s.confidence < 0.6) return;

  queue.push(s);
}

export function popAlerts(): AIAlert[] {
  return queue.splice(0, queue.length);
}
