import { 
  sma, ema, rsi, atr, 
  calculateMACD, calculateBollingerBands, 
  calculateStochastic, calculateWilliamsR,
  calculateADX, calculateParabolicSAR 
} from '../indicators';

export interface MarketData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SignalConfig {
  rsiOverbought: number;
  rsiOversold: number;
  rsiPeriod: number;
  smaShort: number;
  smaLong: number;
  emaShort: number;
  emaLong: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  bbPeriod: number;
  bbStdDev: number;
  stochK: number;
  stochD: number;
  williamsRPeriod: number;
  adxPeriod: number;
  adxThreshold: number;
  psarAcceleration: number;
  psarMaximum: number;
  volumeThreshold: number;
  volatilityThreshold: number;
}

export interface Signal {
  id: string;
  timestamp: number;
  symbol: string;
  signalType: 'BUY' | 'SELL' | 'HOLD';
  strength: number; // 0-100
  confidence: number; // 0-100
  indicators: {
    trend: {
      sma: { direction: 'UP' | 'DOWN' | 'SIDEWAYS'; strength: number };
      ema: { direction: 'UP' | 'DOWN' | 'SIDEWAYS'; strength: number };
      macd: { signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; strength: number };
    };
    momentum: {
      rsi: { value: number; signal: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL'; strength: number };
      stoch: { value: number; signal: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL'; strength: number };
      williamsR: { value: number; signal: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL'; strength: number };
    };
    volatility: {
      bb: { position: 'UPPER' | 'MIDDLE' | 'LOWER'; squeeze: boolean; strength: number };
      atr: { value: number; signal: 'HIGH' | 'NORMAL' | 'LOW'; strength: number };
    };
    volume: {
      volume: { signal: 'HIGH' | 'NORMAL' | 'LOW'; strength: number };
      priceVolume: { divergence: 'BULLISH' | 'BEARISH' | 'NONE'; strength: number };
    };
    trendStrength: {
      adx: { value: number; signal: 'STRONG' | 'WEAK' | 'NEUTRAL'; strength: number };
      psar: { signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; strength: number };
    };
  };
  reasoning: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timeframe: string;
  expectedDuration: number; // hours
  stopLoss?: number;
  takeProfit?: number;
}

export const defaultSignalConfig: SignalConfig = {
  rsiOverbought: 70,
  rsiOversold: 30,
  rsiPeriod: 14,
  smaShort: 20,
  smaLong: 50,
  emaShort: 12,
  emaLong: 26,
  macdFast: 12,
  macdSlow: 26,
  macdSignal: 9,
  bbPeriod: 20,
  bbStdDev: 2,
  stochK: 14,
  stochD: 3,
  williamsRPeriod: 14,
  adxPeriod: 14,
  adxThreshold: 25,
  psarAcceleration: 0.02,
  psarMaximum: 0.2,
  volumeThreshold: 1.5,
  volatilityThreshold: 0.02,
};

export class AISignalGenerator {
  private config: SignalConfig;
  private history: Signal[] = [];

  constructor(config: Partial<SignalConfig> = {}) {
    this.config = { ...defaultSignalConfig, ...config };
  }

  generateSignals(data: MarketData[], symbol: string): Signal[] {
    if (data.length < Math.max(this.config.smaLong, this.config.bbPeriod, this.config.adxPeriod)) {
      return [];
    }

    const signals: Signal[] = [];
    const requiredLength = Math.max(
      this.config.smaLong,
      this.config.bbPeriod,
      this.config.adxPeriod,
      this.config.rsiPeriod,
      this.config.williamsRPeriod
    );

    for (let i = requiredLength; i < data.length; i++) {
      const currentData = data.slice(0, i + 1);
      const signal = this.analyzeMarketData(currentData, symbol, data[i].timestamp);
      if (signal && signal.confidence > 30) {
        signals.push(signal);
      }
    }

    return signals;
  }

  private analyzeMarketData(data: MarketData[], symbol: string, timestamp: number): Signal | null {
    const prices = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const volumes = data.map(d => d.volume);

    // Calculate all indicators
    const smaShort = sma(prices, this.config.smaShort);
    const smaLong = sma(prices, this.config.smaLong);
    const emaShort = ema(prices, this.config.emaShort);
    const emaLong = ema(prices, this.config.emaLong);
    const rsiValues = rsi(prices, this.config.rsiPeriod);
    const bars = prices.map((price, i) => ({
      high: highs[i],
      low: lows[i],
      close: price,
      open: price, // Approximation
      time: i, // Mock time
    }));
    const atrValues = atr(bars, 14);
    const macd = calculateMACD(prices, this.config.macdFast, this.config.macdSlow, this.config.macdSignal);
    const bb = calculateBollingerBands(prices, this.config.bbPeriod, this.config.bbStdDev);
    const stoch = calculateStochastic(highs, lows, prices, this.config.stochK, this.config.stochD);
    const williamsR = calculateWilliamsR(highs, lows, prices, this.config.williamsRPeriod);
    const adx = calculateADX(highs, lows, prices, this.config.adxPeriod);
    const psar = calculateParabolicSAR(highs, lows, this.config.psarAcceleration, this.config.psarMaximum);

    const currentIndex = data.length - 1;
    const currentPrice = prices[currentIndex];
    const currentVolume = volumes[currentIndex];
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;

    // Analyze trend indicators
    const trendSignals = this.analyzeTrendSignals(
      smaShort, smaLong, emaShort, emaLong, macd, currentIndex
    );

    // Analyze momentum indicators
    const momentumSignals = this.analyzeMomentumSignals(
      rsiValues, stoch, williamsR, currentIndex
    );

    // Analyze volatility indicators
    const volatilitySignals = this.analyzeVolatilitySignals(
      bb, atrValues, currentIndex, currentPrice
    );

    // Analyze volume indicators
    const volumeSignals = this.analyzeVolumeSignals(
      volumes, prices, currentIndex, avgVolume
    );

    // Analyze trend strength indicators
    const trendStrengthSignals = this.analyzeTrendStrengthSignals(
      adx, psar, currentIndex, currentPrice
    );

    // Combine all signals
    const combinedSignal = this.combineSignals(
      trendSignals, momentumSignals, volatilitySignals, 
      volumeSignals, trendStrengthSignals
    );

    if (!combinedSignal) return null;

    // Generate reasoning
    const reasoning = this.generateReasoning(
      trendSignals, momentumSignals, volatilitySignals, 
      volumeSignals, trendStrengthSignals, combinedSignal
    );

    // Calculate risk level
    const riskLevel = this.calculateRiskLevel(
      atrValues[currentIndex], volatilitySignals, trendStrengthSignals
    );

    // Calculate stop loss and take profit
    const { stopLoss, takeProfit } = this.calculateStopLossTakeProfit(
      currentPrice, atrValues[currentIndex], combinedSignal.signalType as 'BUY' | 'SELL'
    );

    return {
      id: `${symbol}_${timestamp}`,
      timestamp,
      symbol,
      signalType: combinedSignal.signalType as 'BUY' | 'SELL',
      strength: combinedSignal.strength,
      confidence: combinedSignal.confidence,
      indicators: {
        trend: trendSignals,
        momentum: momentumSignals,
        volatility: volatilitySignals,
        volume: volumeSignals,
        trendStrength: trendStrengthSignals,
      },
      reasoning,
      riskLevel,
      timeframe: '1D',
      expectedDuration: this.calculateExpectedDuration(combinedSignal.strength, riskLevel),
      stopLoss,
      takeProfit,
    };
  }

  private analyzeTrendSignals(smaShort: number[], smaLong: number[], emaShort: number[], emaLong: number[], macd: any, index: number) {
    const smaDirection = this.getTrendDirection(smaShort[index], smaLong[index]);
    const emaDirection = this.getTrendDirection(emaShort[index], emaLong[index]);
    const macdSignal = this.getMACDSignal(macd, index);

    return {
      sma: {
        direction: smaDirection.direction,
        strength: smaDirection.strength
      },
      ema: {
        direction: emaDirection.direction,
        strength: emaDirection.strength
      },
      macd: {
        signal: macdSignal.signal,
        strength: macdSignal.strength
      }
    };
  }

  private analyzeMomentumSignals(rsi: number[], stoch: any, williamsR: number[], index: number) {
    const rsiSignal = this.getRSISignal(rsi[index]);
    const stochSignal = this.getStochasticSignal(stoch, index);
    const williamsRSignal = this.getWilliamsRSignal(williamsR[index]);

    return {
      rsi: {
        value: rsi[index],
        signal: rsiSignal.signal,
        strength: rsiSignal.strength
      },
      stoch: {
        value: stoch.k[index],
        signal: stochSignal.signal,
        strength: stochSignal.strength
      },
      williamsR: {
        value: williamsR[index],
        signal: williamsRSignal.signal,
        strength: williamsRSignal.strength
      }
    };
  }

  private analyzeVolatilitySignals(bb: any, atr: number[], index: number, currentPrice: number) {
    const bbSignal = this.getBollingerBandsSignal(bb, index, currentPrice);
    const atrSignal = this.getATRSignal(atr, index);

    return {
      bb: {
        position: bbSignal.position,
        squeeze: bbSignal.squeeze,
        strength: bbSignal.strength
      },
      atr: {
        value: atr[index],
        signal: atrSignal.signal,
        strength: atrSignal.strength
      }
    };
  }

  private analyzeVolumeSignals(volumes: number[], prices: number[], index: number, avgVolume: number) {
    const volumeSignal = this.getVolumeSignal(volumes[index], avgVolume);
    const priceVolumeSignal = this.getPriceVolumeSignal(volumes, prices, index);

    return {
      volume: {
        signal: volumeSignal.signal,
        strength: volumeSignal.strength
      },
      priceVolume: {
        divergence: priceVolumeSignal.divergence,
        strength: priceVolumeSignal.strength
      }
    };
  }

  private analyzeTrendStrengthSignals(adx: number[], psar: number[], index: number, currentPrice: number) {
    const adxSignal = this.getADXSignal(adx[index]);
    const psarSignal = this.getParabolicSARSignal(psar[index], currentPrice);

    return {
      adx: {
        value: adx[index],
        signal: adxSignal.signal,
        strength: adxSignal.strength
      },
      psar: {
        signal: psarSignal.signal,
        strength: psarSignal.strength
      }
    };
  }

  private combineSignals(trend: any, momentum: any, volatility: any, volume: any, trendStrength: any) {
    const signals = [];
    let totalWeight = 0;

    // Trend signals (weight: 30%)
    const trendScore = this.calculateTrendScore(trend);
    signals.push({ score: trendScore, weight: 0.3 });
    totalWeight += 0.3;

    // Momentum signals (weight: 25%)
    const momentumScore = this.calculateMomentumScore(momentum);
    signals.push({ score: momentumScore, weight: 0.25 });
    totalWeight += 0.25;

    // Volatility signals (weight: 20%)
    const volatilityScore = this.calculateVolatilityScore(volatility);
    signals.push({ score: volatilityScore, weight: 0.2 });
    totalWeight += 0.2;

    // Volume signals (weight: 15%)
    const volumeScore = this.calculateVolumeScore(volume);
    signals.push({ score: volumeScore, weight: 0.15 });
    totalWeight += 0.15;

    // Trend strength signals (weight: 10%)
    const trendStrengthScore = this.calculateTrendStrengthScore(trendStrength);
    signals.push({ score: trendStrengthScore, weight: 0.1 });
    totalWeight += 0.1;

    // Calculate weighted average
    const weightedScore = signals.reduce((sum, signal) => sum + (signal.score * signal.weight), 0) / totalWeight;

    if (Math.abs(weightedScore) < 0.3) {
      return null; // No clear signal
    }

    const signalType = weightedScore > 0 ? 'BUY' : 'SELL';
    const strength = Math.min(Math.abs(weightedScore) * 100, 100);
    const confidence = this.calculateConfidence(signals, weightedScore);

    return {
      signalType,
      strength,
      confidence
    };
  }

  // Helper methods for individual indicator analysis
  private getTrendDirection(short: number, long: number) {
    const diff = (short - long) / long;
    if (Math.abs(diff) < 0.01) {
      return { direction: 'SIDEWAYS' as const, strength: Math.abs(diff) * 100 };
    }
    return {
      direction: diff > 0 ? 'UP' as const : 'DOWN' as const,
      strength: Math.min(Math.abs(diff) * 1000, 100)
    };
  }

  private getMACDSignal(macd: any, index: number) {
    if (!macd.macd[index] || !macd.signal[index]) {
      return { signal: 'NEUTRAL' as const, strength: 0 };
    }

    const macdLine = macd.macd[index];
    const signalLine = macd.signal[index];
    const histogram = macd.histogram[index];

    if (macdLine > signalLine && histogram > 0) {
      return { signal: 'BULLISH' as const, strength: Math.min(Math.abs(histogram) * 100, 100) };
    } else if (macdLine < signalLine && histogram < 0) {
      return { signal: 'BEARISH' as const, strength: Math.min(Math.abs(histogram) * 100, 100) };
    }

    return { signal: 'NEUTRAL' as const, strength: Math.abs(histogram) * 50 };
  }

  private getRSISignal(rsiValue: number) {
    if (rsiValue >= this.config.rsiOverbought) {
      return { signal: 'OVERBOUGHT' as const, strength: (rsiValue - 50) / 50 * 100 };
    } else if (rsiValue <= this.config.rsiOversold) {
      return { signal: 'OVERSOLD' as const, strength: (50 - rsiValue) / 50 * 100 };
    }
    return { signal: 'NEUTRAL' as const, strength: Math.abs(rsiValue - 50) };
  }

  private getStochasticSignal(stoch: any, index: number) {
    const k = stoch.k[index];
    const d = stoch.d[index];

    if (k >= 80 && d >= 80) {
      return { signal: 'OVERBOUGHT' as const, strength: (k - 50) / 50 * 100 };
    } else if (k <= 20 && d <= 20) {
      return { signal: 'OVERSOLD' as const, strength: (50 - k) / 50 * 100 };
    }
    return { signal: 'NEUTRAL' as const, strength: Math.abs(k - 50) };
  }

  private getWilliamsRSignal(williamsR: number) {
    if (williamsR >= -20) {
      return { signal: 'OVERBOUGHT' as const, strength: (williamsR + 50) / 50 * 100 };
    } else if (williamsR <= -80) {
      return { signal: 'OVERSOLD' as const, strength: (-50 - williamsR) / 50 * 100 };
    }
    return { signal: 'NEUTRAL' as const, strength: Math.abs(williamsR + 50) };
  }

  private getBollingerBandsSignal(bb: any, index: number, currentPrice: number) {
    const upper = bb.upper[index];
    const middle = bb.middle[index];
    const lower = bb.lower[index];

    if (currentPrice >= upper) {
      return { position: 'UPPER' as const, squeeze: false, strength: 100 };
    } else if (currentPrice <= lower) {
      return { position: 'LOWER' as const, squeeze: false, strength: 100 };
    }

    const squeeze = (upper - lower) / middle < 0.1;
    const distanceFromMiddle = Math.abs(currentPrice - middle) / middle;

    return {
      position: 'MIDDLE' as const,
      squeeze,
      strength: distanceFromMiddle * 100
    };
  }

  private getATRSignal(atr: number[], index: number) {
    const currentATR = atr[index];
    const avgATR = atr.slice(-20).reduce((a, b) => a + b, 0) / 20;

    if (currentATR > avgATR * 1.5) {
      return { signal: 'HIGH' as const, strength: (currentATR / avgATR - 1) * 100 };
    } else if (currentATR < avgATR * 0.7) {
      return { signal: 'LOW' as const, strength: (1 - currentATR / avgATR) * 100 };
    }
    return { signal: 'NORMAL' as const, strength: 50 };
  }

  private getVolumeSignal(currentVolume: number, avgVolume: number) {
    const ratio = currentVolume / avgVolume;

    if (ratio >= this.config.volumeThreshold) {
      return { signal: 'HIGH' as const, strength: Math.min((ratio - 1) * 100, 100) };
    } else if (ratio <= 0.7) {
      return { signal: 'LOW' as const, strength: (1 - ratio) * 100 };
    }
    return { signal: 'NORMAL' as const, strength: 50 };
  }

  private getPriceVolumeSignal(volumes: number[], prices: number[], index: number) {
    if (index < 5) return { divergence: 'NONE' as const, strength: 0 };

    const recentVolumes = volumes.slice(index - 5, index + 1);
    const recentPrices = prices.slice(index - 5, index + 1);

    const volumeTrend = this.getLinearTrend(recentVolumes);
    const priceTrend = this.getLinearTrend(recentPrices);

    if (volumeTrend > 0 && priceTrend < 0) {
      return { divergence: 'BULLISH' as const, strength: Math.abs(volumeTrend * priceTrend) * 50 };
    } else if (volumeTrend < 0 && priceTrend > 0) {
      return { divergence: 'BEARISH' as const, strength: Math.abs(volumeTrend * priceTrend) * 50 };
    }

    return { divergence: 'NONE' as const, strength: 0 };
  }

  private getADXSignal(adx: number) {
    if (adx >= this.config.adxThreshold) {
      return { signal: 'STRONG' as const, strength: (adx - 25) / 75 * 100 };
    } else if (adx <= 20) {
      return { signal: 'WEAK' as const, strength: (20 - adx) / 20 * 100 };
    }
    return { signal: 'NEUTRAL' as const, strength: adx };
  }

  private getParabolicSARSignal(psar: number, currentPrice: number) {
    if (currentPrice > psar) {
      return { signal: 'BULLISH' as const, strength: ((currentPrice - psar) / psar) * 100 };
    } else if (currentPrice < psar) {
      return { signal: 'BEARISH' as const, strength: ((psar - currentPrice) / psar) * 100 };
    }
    return { signal: 'NEUTRAL' as const, strength: 0 };
  }

  // Scoring methods
  private calculateTrendScore(trend: any) {
    let score = 0;
    
    if (trend.sma.direction === 'UP') score += 0.3 * trend.sma.strength / 100;
    else if (trend.sma.direction === 'DOWN') score -= 0.3 * trend.sma.strength / 100;

    if (trend.ema.direction === 'UP') score += 0.3 * trend.ema.strength / 100;
    else if (trend.ema.direction === 'DOWN') score -= 0.3 * trend.ema.strength / 100;

    if (trend.macd.signal === 'BULLISH') score += 0.4 * trend.macd.strength / 100;
    else if (trend.macd.signal === 'BEARISH') score -= 0.4 * trend.macd.strength / 100;

    return score;
  }

  private calculateMomentumScore(momentum: any) {
    let score = 0;

    if (momentum.rsi.signal === 'OVERSOLD') score += 0.4 * momentum.rsi.strength / 100;
    else if (momentum.rsi.signal === 'OVERBOUGHT') score -= 0.4 * momentum.rsi.strength / 100;

    if (momentum.stoch.signal === 'OVERSOLD') score += 0.3 * momentum.stoch.strength / 100;
    else if (momentum.stoch.signal === 'OVERBOUGHT') score -= 0.3 * momentum.stoch.strength / 100;

    if (momentum.williamsR.signal === 'OVERSOLD') score += 0.3 * momentum.williamsR.strength / 100;
    else if (momentum.williamsR.signal === 'OVERBOUGHT') score -= 0.3 * momentum.williamsR.strength / 100;

    return score;
  }

  private calculateVolatilityScore(volatility: any) {
    let score = 0;

    if (volatility.bb.position === 'LOWER') score += 0.6 * volatility.bb.strength / 100;
    else if (volatility.bb.position === 'UPPER') score -= 0.6 * volatility.bb.strength / 100;

    if (volatility.atr.signal === 'NORMAL') score += 0.4 * 0.5;
    else if (volatility.atr.signal === 'HIGH') score -= 0.4 * volatility.atr.strength / 100;

    return score;
  }

  private calculateVolumeScore(volume: any) {
    let score = 0;

    if (volume.volume.signal === 'HIGH') score += 0.6 * volume.volume.strength / 100;
    else if (volume.volume.signal === 'LOW') score -= 0.6 * volume.volume.strength / 100;

    if (volume.priceVolume.divergence === 'BULLISH') score += 0.4 * volume.priceVolume.strength / 100;
    else if (volume.priceVolume.divergence === 'BEARISH') score -= 0.4 * volume.priceVolume.strength / 100;

    return score;
  }

  private calculateTrendStrengthScore(trendStrength: any) {
    let score = 0;

    if (trendStrength.adx.signal === 'STRONG') score += 0.5 * trendStrength.adx.strength / 100;
    else if (trendStrength.adx.signal === 'WEAK') score -= 0.5 * trendStrength.adx.strength / 100;

    if (trendStrength.psar.signal === 'BULLISH') score += 0.5 * trendStrength.psar.strength / 100;
    else if (trendStrength.psar.signal === 'BEARISH') score -= 0.5 * trendStrength.psar.strength / 100;

    return score;
  }

  private calculateConfidence(signals: any[], weightedScore: number) {
    const agreement = signals.filter(s => 
      (s.score > 0 && weightedScore > 0) || (s.score < 0 && weightedScore < 0)
    ).length / signals.length;

    const strength = Math.abs(weightedScore);
    const consensus = agreement * 0.6 + strength * 0.4;

    return Math.min(consensus * 100, 100);
  }

  private calculateRiskLevel(atr: number, volatility: any, trendStrength: any) {
    let riskScore = 0;

    if (atr > 0.03) riskScore += 40; // High volatility
    else if (atr > 0.02) riskScore += 20; // Medium volatility

    if (trendStrength.adx.signal === 'WEAK') riskScore += 30;
    else if (trendStrength.adx.signal === 'STRONG') riskScore -= 20;

    if (volatility.bb.squeeze) riskScore += 20; // Bollinger squeeze

    if (riskScore >= 60) return 'HIGH';
    else if (riskScore >= 30) return 'MEDIUM';
    return 'LOW';
  }

  private calculateStopLossTakeProfit(currentPrice: number, atr: number, signalType: 'BUY' | 'SELL') {
    const stopDistance = atr * 2;
    const profitDistance = atr * 3;

    if (signalType === 'BUY') {
      return {
        stopLoss: currentPrice - stopDistance,
        takeProfit: currentPrice + profitDistance
      };
    } else {
      return {
        stopLoss: currentPrice + stopDistance,
        takeProfit: currentPrice - profitDistance
      };
    }
  }

  private calculateExpectedDuration(strength: number, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH') {
    const baseHours = 24;
    const strengthMultiplier = strength / 100;
    const riskMultiplier = riskLevel === 'LOW' ? 1.5 : riskLevel === 'MEDIUM' ? 1 : 0.7;

    return Math.round(baseHours * strengthMultiplier * riskMultiplier);
  }

  private generateReasoning(trend: any, momentum: any, volatility: any, volume: any, trendStrength: any, combinedSignal: any) {
    const reasoning = [];

    // Trend reasoning
    if (trend.sma.direction === trend.ema.direction && trend.macd.signal !== 'NEUTRAL') {
      reasoning.push(`Strong ${trend.sma.direction.toLowerCase()} trend confirmed by moving averages and MACD`);
    }

    // Momentum reasoning
    const momentumSignals = [];
    if (momentum.rsi.signal !== 'NEUTRAL') momentumSignals.push(`RSI ${momentum.rsi.signal.toLowerCase()}`);
    if (momentum.stoch.signal !== 'NEUTRAL') momentumSignals.push(`Stochastic ${momentum.stoch.signal.toLowerCase()}`);
    if (momentum.williamsR.signal !== 'NEUTRAL') momentumSignals.push(`Williams %R ${momentum.williamsR.signal.toLowerCase()}`);

    if (momentumSignals.length > 0) {
      reasoning.push(`Momentum indicators show: ${momentumSignals.join(', ')}`);
    }

    // Volatility reasoning
    if (volatility.bb.position !== 'MIDDLE') {
      reasoning.push(`Price at Bollinger Band ${volatility.bb.position.toLowerCase()} boundary`);
    }
    if (volatility.bb.squeeze) {
      reasoning.push('Bollinger Band squeeze detected - potential breakout ahead');
    }

    // Volume reasoning
    if (volume.volume.signal === 'HIGH') {
      reasoning.push('High volume confirms price movement');
    }
    if (volume.priceVolume.divergence !== 'NONE') {
      reasoning.push(`${volume.priceVolume.divergence.toLowerCase()} divergence between price and volume`);
    }

    // Trend strength reasoning
    if (trendStrength.adx.signal === 'STRONG') {
      reasoning.push('Strong trend confirmed by ADX');
    } else if (trendStrength.adx.signal === 'WEAK') {
      reasoning.push('Weak trend - sideways movement likely');
    }

    return reasoning;
  }

  private getLinearTrend(values: number[]): number {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  // Configuration methods
  updateConfig(newConfig: Partial<SignalConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): SignalConfig {
    return { ...this.config };
  }

  // History methods
  addSignalToHistory(signal: Signal) {
    this.history.push(signal);
    // Keep only last 1000 signals
    if (this.history.length > 1000) {
      this.history = this.history.slice(-1000);
    }
  }

  getSignalHistory(symbol?: string, limit: number = 100): Signal[] {
    let filtered = this.history;
    if (symbol) {
      filtered = this.history.filter(s => s.symbol === symbol);
    }
    return filtered.slice(-limit);
  }

  getSignalPerformance(symbol?: string): { accuracy: number; totalSignals: number; profitableSignals: number } {
    const signals = this.getSignalHistory(symbol);
    // This would need actual price data to calculate real performance
    // For now, return placeholder data
    return {
      accuracy: 65, // Placeholder
      totalSignals: signals.length,
      profitableSignals: Math.round(signals.length * 0.65)
    };
  }
}
