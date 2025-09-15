import { getAlpacaService } from '../alpaca/client';

export interface Features {
  smaFast: number;
  smaSlow: number;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  volatility: number;
}

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  
  return sma;
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  const firstSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(firstSMA);
  
  for (let i = period; i < prices.length; i++) {
    const currentEMA = (prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier));
    ema.push(currentEMA);
  }
  
  return ema;
}

/**
 * Calculate Relative Strength Index
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  // Calculate RSI
  for (let i = period; i < gains.length; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
    
    const rs = avgGain / avgLoss;
    const rsiValue = 100 - (100 / (1 + rs));
    rsi.push(rsiValue);
  }
  
  return rsi;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(prices: number[]): {
  macd: number[];
  signal: number[];
  histogram: number[];
} {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  
  // MACD line
  const macd: number[] = [];
  for (let i = 0; i < ema12.length; i++) {
    const macd26Index = i + (26 - 12); // Adjust for different EMA lengths
    if (macd26Index < ema26.length) {
      macd.push(ema12[i] - ema26[macd26Index]);
    }
  }
  
  // Signal line (9-period EMA of MACD)
  const signal = calculateEMA(macd, 9);
  
  // Histogram
  const histogram: number[] = [];
  for (let i = 0; i < macd.length; i++) {
    const signalIndex = i + (macd.length - signal.length);
    if (signalIndex >= 0 && signalIndex < signal.length) {
      histogram.push(macd[i] - signal[signalIndex]);
    }
  }
  
  return { macd, signal, histogram };
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
  upper: number[];
  middle: number[];
  lower: number[];
} {
  const sma = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const mean = sma[i - period + 1];
    
    // Calculate standard deviation
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    upper.push(mean + (stdDev * standardDeviation));
    lower.push(mean - (stdDev * standardDeviation));
  }
  
  return {
    upper,
    middle: sma,
    lower
  };
}

/**
 * Calculate Volatility (standard deviation of returns)
 */
export function calculateVolatility(prices: number[], period: number = 20): number[] {
  const returns: number[] = [];
  const volatility: number[] = [];
  
  // Calculate returns
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  
  // Calculate rolling volatility
  for (let i = period - 1; i < returns.length; i++) {
    const slice = returns.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    volatility.push(stdDev);
  }
  
  return volatility;
}

/**
 * Extract features from historical data
 */
export async function extractFeatures(
  symbol: string,
  timeframe: string = '1Day',
  lookback: number = 30
): Promise<Features> {
  try {
    // In a real app, you'd get the user ID from the session/auth
    const userId = 'demo-user';
    const isLiveMode = false;

    const alpacaService = getAlpacaService(userId, isLiveMode);
    const bars = await alpacaService.getBars(symbol, timeframe, lookback);

    if (!bars || bars.length < 30) {
      throw new Error('Insufficient historical data');
    }

    const closes = bars.map(bar => bar.c);
    const highs = bars.map(bar => bar.h);
    const lows = bars.map(bar => bar.l);

    // Calculate indicators
    const smaFast = calculateSMA(closes, 10);
    const smaSlow = calculateSMA(closes, 20);
    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes);
    const bollingerBands = calculateBollingerBands(closes, 20, 2);
    const volatility = calculateVolatility(closes, 20);

    // Return the latest values
    return {
      smaFast: smaFast[smaFast.length - 1] || 0,
      smaSlow: smaSlow[smaSlow.length - 1] || 0,
      rsi: rsi[rsi.length - 1] || 50,
      macd: {
        macd: macd.macd[macd.macd.length - 1] || 0,
        signal: macd.signal[macd.signal.length - 1] || 0,
        histogram: macd.histogram[macd.histogram.length - 1] || 0,
      },
      bollingerBands: {
        upper: bollingerBands.upper[bollingerBands.upper.length - 1] || 0,
        middle: bollingerBands.middle[bollingerBands.middle.length - 1] || 0,
        lower: bollingerBands.lower[bollingerBands.lower.length - 1] || 0,
      },
      volatility: volatility[volatility.length - 1] || 0,
    };
  } catch (error) {
    console.error('Feature extraction error:', error);
    
    // Return default values if extraction fails
    return {
      smaFast: 0,
      smaSlow: 0,
      rsi: 50,
      macd: { macd: 0, signal: 0, histogram: 0 },
      bollingerBands: { upper: 0, middle: 0, lower: 0 },
      volatility: 0,
    };
  }
}
