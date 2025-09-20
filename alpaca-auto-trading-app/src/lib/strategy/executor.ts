/**
 * File: src/lib/strategy/executor.ts
 * Description: Strategy execution and decision making.
 */
import { Bar } from '@/types/market';

export interface StrategyConfig {
  name: string;
  parameters: Record<string, any>;
  enabled: boolean;
}

export interface StrategyResult {
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
  price?: number;
  quantity?: number;
}

export class StrategyExecutor {
  private strategies = new Map<string, StrategyConfig>();

  constructor() {
    this.registerDefaultStrategies();
  }

  private registerDefaultStrategies() {
    this.strategies.set('donchian', {
      name: 'Donchian Channel',
      parameters: { period: 20, threshold: 0.02 },
      enabled: true,
    });

    this.strategies.set('rsi', {
      name: 'RSI Mean Reversion',
      parameters: { period: 14, oversold: 30, overbought: 70 },
      enabled: true,
    });

    this.strategies.set('momentum', {
      name: 'Momentum',
      parameters: { period: 10, threshold: 0.05 },
      enabled: true,
    });
  }

  public executeStrategy(strategyName: string, data: Bar[]): StrategyResult {
    const strategy = this.strategies.get(strategyName);
    if (!strategy || !strategy.enabled) {
      return {
        action: 'hold',
        confidence: 0,
        reason: 'Strategy not found or disabled',
      };
    }

    switch (strategyName) {
      case 'donchian':
        return this.executeDonchianStrategy(data, strategy.parameters);
      case 'rsi':
        return this.executeRSIStrategy(data, strategy.parameters);
      case 'momentum':
        return this.executeMomentumStrategy(data, strategy.parameters);
      default:
        return {
          action: 'hold',
          confidence: 0,
          reason: 'Unknown strategy',
        };
    }
  }

  private executeDonchianStrategy(data: Bar[], params: any): StrategyResult {
    if (data.length < params.period) {
      return { action: 'hold', confidence: 0, reason: 'Insufficient data' };
    }

    const recent = data.slice(-params.period);
    const highest = Math.max(...recent.map(bar => bar.h));
    const lowest = Math.min(...recent.map(bar => bar.l));
    const current = data[data.length - 1].c;

    const upperBreakout = current > highest * (1 - params.threshold);
    const lowerBreakout = current < lowest * (1 + params.threshold);

    if (upperBreakout) {
      return {
        action: 'buy',
        confidence: 0.7,
        reason: 'Upper Donchian breakout',
        price: current,
      };
    } else if (lowerBreakout) {
      return {
        action: 'sell',
        confidence: 0.7,
        reason: 'Lower Donchian breakout',
        price: current,
      };
    }

    return { action: 'hold', confidence: 0.3, reason: 'No breakout detected' };
  }

  private executeRSIStrategy(data: Bar[], params: any): StrategyResult {
    if (data.length < params.period) {
      return { action: 'hold', confidence: 0, reason: 'Insufficient data' };
    }

    const rsi = this.calculateRSI(data, params.period);
    const current = data[data.length - 1].c;

    if (rsi < params.oversold) {
      return {
        action: 'buy',
        confidence: 0.8,
        reason: 'RSI oversold',
        price: current,
      };
    } else if (rsi > params.overbought) {
      return {
        action: 'sell',
        confidence: 0.8,
        reason: 'RSI overbought',
        price: current,
      };
    }

    return { action: 'hold', confidence: 0.5, reason: 'RSI neutral' };
  }

  private executeMomentumStrategy(data: Bar[], params: any): StrategyResult {
    if (data.length < params.period) {
      return { action: 'hold', confidence: 0, reason: 'Insufficient data' };
    }

    const current = data[data.length - 1].c;
    const past = data[data.length - params.period - 1].c;
    const momentum = (current - past) / past;

    if (momentum > params.threshold) {
      return {
        action: 'buy',
        confidence: 0.6,
        reason: 'Positive momentum',
        price: current,
      };
    } else if (momentum < -params.threshold) {
      return {
        action: 'sell',
        confidence: 0.6,
        reason: 'Negative momentum',
        price: current,
      };
    }

    return { action: 'hold', confidence: 0.4, reason: 'No significant momentum' };
  }

  private calculateRSI(data: Bar[], period: number): number {
    if (data.length < period + 1) return 50;

    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < data.length; i++) {
      const change = data[i].c - data[i - 1].c;
      if (change > 0) {
        gains.push(change);
        losses.push(0);
      } else {
        gains.push(0);
        losses.push(Math.abs(change));
      }
    }

    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }
}

export const strategyExecutor = new StrategyExecutor();

export function decideOrder(strategy: string, data: Bar[]): StrategyResult {
  return strategyExecutor.executeStrategy(strategy, data);
}