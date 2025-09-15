// lib/strategy/signals.ts
import { Bar, sma, rsi, atr } from "../indicators";

export type Signal = { action: "buy" | "sell" | "hold"; confidence: number; reason: string; stop?: number; take?: number };

export function trendSignal(bars: Bar[]): Signal {
  const closes = bars.map(b => b.close);
  const s20 = sma(closes, 20), s50 = sma(closes, 50);
  const i = closes.length - 1;
  const breakout = Math.max(...closes.slice(-55)); // 55-day high
  const inUp = s20[i] > s50[i] && closes[i] >= breakout * 0.999; // allow tiny slop
  const inDown = s20[i] < s50[i] && closes[i] <= Math.min(...closes.slice(-55)) * 1.001;

  if (inUp) return { action: "buy", confidence: 0.65, reason: "SMA20>50 + 55D breakout" };
  if (inDown) return { action: "sell", confidence: 0.60, reason: "SMA20<50 + 55D breakdown" };
  return { action: "hold", confidence: 0.52, reason: "No trend edge" };
}

export function rsi2Dip(bars: Bar[]): Signal {
  const closes = bars.map(b => b.close);
  const r = rsi(closes, 2);
  const i = closes.length - 1;
  if (r[i] <= 5) return { action: "buy", confidence: 0.58, reason: "RSI2 <= 5 (mean reversion)" };
  if (r[i] >= 95) return { action: "sell", confidence: 0.58, reason: "RSI2 >= 95 (overbought)" };
  return { action: "hold", confidence: 0.51, reason: "RSI2 neutral" };
}

export function combineSignals(bars: Bar[]): Signal {
  const t = trendSignal(bars);
  const m = rsi2Dip(bars);
  // Weighted vote; when aligned, boost confidence
  if (t.action !== "hold" && t.action === m.action) {
    return { action: t.action, confidence: Math.min(0.75, (t.confidence + m.confidence + 0.05)), reason: `${t.reason} + ${m.reason}` };
  }
  if (t.action !== "hold") return t;
  if (m.action !== "hold") return m;
  return { action: "hold", confidence: 0.5, reason: "No edge" };
}

export function attachStops(bars: Bar[], sig: Signal, atrMult = 2): Signal {
  const i = bars.length - 1;
  const a = atr(bars, 14)[i];
  if (!a || sig.action === "hold") return sig;
  const px = bars[i].close;
  return sig.action === "buy"
    ? { ...sig, stop: +(px - atrMult * a).toFixed(2), take: +(px + 3 * a).toFixed(2) }
    : { ...sig, stop: +(px + atrMult * a).toFixed(2), take: +(px - 3 * a).toFixed(2) };
}