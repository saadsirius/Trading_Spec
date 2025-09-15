// lib/risk.ts
import { Bar } from "./indicators";

export function positionNotionalFromVol(dailyVol: number, equity: number, sleeveShare: number, targetAnnVol: number): number {
  const targetDailyVol = targetAnnVol / Math.sqrt(252);
  const volRatio = Math.min(1.5, Math.max(0.5, targetDailyVol / dailyVol));
  return equity * sleeveShare * volRatio;
}

export function capByRiskLimits(
  desiredNotional: number, 
  price: number, 
  stopDistance?: number,
  limits: {
    equity: number;
    maxTradeRiskPct: number;
    maxDailyRiskPct: number;
    targetAnnVol: number;
    kellyCap: number;
  } = {
    equity: 1000,
    maxTradeRiskPct: 0.005,
    maxDailyRiskPct: 0.01,
    targetAnnVol: 0.10,
    kellyCap: 0.25
  }
) {
  const maxByTradeRisk = stopDistance 
    ? (limits.equity * limits.maxTradeRiskPct) / (stopDistance * price)
    : Infinity;
  
  const maxByDailyRisk = limits.equity * limits.maxDailyRiskPct / price;
  const maxByKelly = limits.equity * limits.kellyCap / price;
  
  const maxQty = Math.min(maxByTradeRisk, maxByDailyRisk, maxByKelly, desiredNotional / price);
  
  return {
    qty: Math.max(0, Math.floor(maxQty * 100) / 100), // Round to 2 decimals
    notional: Math.max(0, Math.floor(maxQty * price * 100) / 100)
  };
}

export function kellyFraction(winRate: number, payoff: number): number {
  if (winRate <= 0 || winRate >= 1) return 0;
  const kelly = (winRate * payoff - (1 - winRate)) / payoff;
  return Math.max(0, Math.min(0.25, kelly)); // Cap at 25%
}

export function checkDailyPnLLimit(currentPnL: number, equity: number, limit = 0.01): boolean {
  return currentPnL / equity <= -limit;
}

export function checkDrawdownLimit(currentEquity: number, peakEquity: number, limit = 0.10): boolean {
  return (peakEquity - currentEquity) / peakEquity >= limit;
}

export function getRiskMultiplier(equity: number, peakEquity: number): number {
  const drawdown = (peakEquity - equity) / peakEquity;
  if (drawdown >= 0.10) return 0.5; // Halve risk after 10% drawdown
  return 1.0;
}
