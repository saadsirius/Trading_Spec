/**
 * File: src/lib/ai/signals.ts
 * Description: AI signal generation and analysis.
 */
import { Bar } from '@/types/market';

export interface AISignal {
  id: string;
  symbol: string;
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
  timestamp: number;
  price?: number;
  metadata?: Record<string, any>;
}

export interface SignalConfig {
  enabled: boolean;
  threshold: number;
  lookback: number;
  strategies: string[];
}

export const defaultSignalConfig: SignalConfig = {
  enabled: true,
  threshold: 0.6,
  lookback: 100,
  strategies: ['technical', 'sentiment', 'momentum'],
};

export class AISignalGenerator {
  private config: SignalConfig;

  constructor(config: SignalConfig = defaultSignalConfig) {
    this.config = config;
  }

  public async generateSignals(symbol: string, data: Bar[]): Promise<AISignal[]> {
    if (!this.config.enabled || data.length < this.config.lookback) {
      return [];
    }

    const signals: AISignal[] = [];
    const recentData = data.slice(-this.config.lookback);

    // Technical analysis signals
    if (this.config.strategies.includes('technical')) {
      const technicalSignal = this.generateTechnicalSignal(symbol, recentData);
      if (technicalSignal) signals.push(technicalSignal);
    }

    // Sentiment analysis signals
    if (this.config.strategies.includes('sentiment')) {
      const sentimentSignal = await this.generateSentimentSignal(symbol, recentData);
      if (sentimentSignal) signals.push(sentimentSignal);
    }

    // Momentum signals
    if (this.config.strategies.includes('momentum')) {
      const momentumSignal = this.generateMomentumSignal(symbol, recentData);
      if (momentumSignal) signals.push(momentumSignal);
    }

    return signals.filter(signal => signal.confidence >= this.config.threshold);
  }

  private generateTechnicalSignal(symbol: string, data: Bar[]): AISignal | null {
    if (data.length < 20) return null;

    const current = data[data.length - 1];
    const rsi = this.calculateRSI(data, 14);
    const macd = this.calculateMACD(data);
    const bollinger = this.calculateBollingerBands(data);

    let signal: 'buy' | 'sell' | 'hold' = 'hold';
    let confidence = 0;
    let reason = '';

    // RSI signals
    if (rsi < 30) {
      signal = 'buy';
      confidence = 0.7;
      reason = 'RSI oversold';
    } else if (rsi > 70) {
      signal = 'sell';
      confidence = 0.7;
      reason = 'RSI overbought';
    }

    // MACD signals
    if (macd.histogram > 0 && macd.macd > macd.signal) {
      if (signal === 'buy') {
        confidence = Math.min(0.9, confidence + 0.2);
        reason += ' + MACD bullish';
      } else if (signal === 'hold') {
        signal = 'buy';
        confidence = 0.6;
        reason = 'MACD bullish';
      }
    } else if (macd.histogram < 0 && macd.macd < macd.signal) {
      if (signal === 'sell') {
        confidence = Math.min(0.9, confidence + 0.2);
        reason += ' + MACD bearish';
      } else if (signal === 'hold') {
        signal = 'sell';
        confidence = 0.6;
        reason = 'MACD bearish';
      }
    }

    // Bollinger Bands signals
    if (current.c < bollinger.lower) {
      if (signal === 'buy') {
        confidence = Math.min(0.9, confidence + 0.1);
        reason += ' + BB oversold';
      }
    } else if (current.c > bollinger.upper) {
      if (signal === 'sell') {
        confidence = Math.min(0.9, confidence + 0.1);
        reason += ' + BB overbought';
      }
    }

    if (signal === 'hold') return null;

    return {
      id: `technical_${symbol}_${Date.now()}`,
      symbol,
      type: signal,
      confidence,
      reason,
      timestamp: Date.now(),
      price: current.c,
      metadata: { rsi, macd, bollinger },
    };
  }

  private async generateSentimentSignal(symbol: string, data: Bar[]): Promise<AISignal | null> {
    // Mock sentiment analysis - in real implementation, this would call an AI service
    const sentiment = Math.random() * 2 - 1; // -1 to 1
    const confidence = Math.abs(sentiment);
    
    if (confidence < this.config.threshold) return null;

    const signal: 'buy' | 'sell' = sentiment > 0 ? 'buy' : 'sell';
    const reason = sentiment > 0 ? 'Positive sentiment' : 'Negative sentiment';

    return {
      id: `sentiment_${symbol}_${Date.now()}`,
      symbol,
      type: signal,
      confidence,
      reason,
      timestamp: Date.now(),
      metadata: { sentiment },
    };
  }

  private generateMomentumSignal(symbol: string, data: Bar[]): AISignal | null {
    if (data.length < 20) return null;

    const current = data[data.length - 1];
    const past = data[data.length - 20];
    const momentum = (current.c - past.c) / past.c;

    if (Math.abs(momentum) < 0.05) return null; // 5% threshold

    const signal: 'buy' | 'sell' = momentum > 0 ? 'buy' : 'sell';
    const confidence = Math.min(0.8, Math.abs(momentum) * 10);
    const reason = momentum > 0 ? 'Positive momentum' : 'Negative momentum';

    return {
      id: `momentum_${symbol}_${Date.now()}`,
      symbol,
      type: signal,
      confidence,
      reason,
      timestamp: Date.now(),
      price: current.c,
      metadata: { momentum },
    };
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

  private calculateMACD(data: Bar[]): { macd: number; signal: number; histogram: number } {
    if (data.length < 26) return { macd: 0, signal: 0, histogram: 0 };

    const prices = data.map(bar => bar.c);
    const fastEMA = this.calculateEMA(prices, 12);
    const slowEMA = this.calculateEMA(prices, 26);
    const macd = fastEMA - slowEMA;
    const signal = this.calculateEMA([macd], 9);
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  private calculateBollingerBands(data: Bar[]): { upper: number; middle: number; lower: number } {
    if (data.length < 20) return { upper: 0, middle: 0, lower: 0 };

    const prices = data.slice(-20).map(bar => bar.c);
    const sma = prices.reduce((a, b) => a + b, 0) / 20;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / 20;
    const standardDeviation = Math.sqrt(variance);

    return {
      upper: sma + (standardDeviation * 2),
      middle: sma,
      lower: sma - (standardDeviation * 2),
    };
  }

  private calculateEMA(data: number[], period: number): number {
    if (data.length === 0) return 0;
    if (data.length === 1) return data[0];

    const multiplier = 2 / (period + 1);
    let ema = data[0];

    for (let i = 1; i < data.length; i++) {
      ema = (data[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }
}

export const AISignalGenerator = new AISignalGenerator();