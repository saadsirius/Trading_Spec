/**
 * File: src/lib/indicators.ts
 * Description: Technical indicators and calculations.
 */
import { Bar } from '@/types/market';

export interface IndicatorResult {
  value: number;
  signal: 'buy' | 'sell' | 'hold';
  strength: number;
}

export class TechnicalIndicators {
  static calculateRSI(data: Bar[], period = 14): number {
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

  static calculateMACD(data: Bar[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9): {
    macd: number;
    signal: number;
    histogram: number;
  } {
    if (data.length < slowPeriod) {
      return { macd: 0, signal: 0, histogram: 0 };
    }

    const prices = data.map(bar => bar.c);
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    const macd = fastEMA - slowEMA;
    const signal = this.calculateEMA([macd], signalPeriod);
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  static calculateSMA(data: Bar[], period: number): number {
    if (data.length < period) return 0;
    const prices = data.slice(-period).map(bar => bar.c);
    return prices.reduce((a, b) => a + b, 0) / period;
  }

  static calculateEMA(data: number[], period: number): number {
    if (data.length === 0) return 0;
    if (data.length === 1) return data[0];

    const multiplier = 2 / (period + 1);
    let ema = data[0];

    for (let i = 1; i < data.length; i++) {
      ema = (data[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  static calculateBollingerBands(data: Bar[], period = 20, stdDev = 2): {
    upper: number;
    middle: number;
    lower: number;
  } {
    if (data.length < period) {
      return { upper: 0, middle: 0, lower: 0 };
    }

    const prices = data.slice(-period).map(bar => bar.c);
    const sma = prices.reduce((a, b) => a + b, 0) / period;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);

    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev),
    };
  }

  static calculateATR(data: Bar[], period = 14): number {
    if (data.length < period + 1) return 0;

    const trueRanges: number[] = [];
    for (let i = 1; i < data.length; i++) {
      const high = data[i].h;
      const low = data[i].l;
      const prevClose = data[i - 1].c;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }

    return trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
  }

  static calculateDonchianChannels(data: Bar[], period = 20): {
    upper: number;
    lower: number;
    middle: number;
  } {
    if (data.length < period) {
      return { upper: 0, lower: 0, middle: 0 };
    }

    const recent = data.slice(-period);
    const upper = Math.max(...recent.map(bar => bar.h));
    const lower = Math.min(...recent.map(bar => bar.l));
    const middle = (upper + lower) / 2;

    return { upper, lower, middle };
  }
}

export default TechnicalIndicators;
