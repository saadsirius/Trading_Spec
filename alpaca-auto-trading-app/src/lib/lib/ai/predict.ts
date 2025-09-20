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

export interface PredictionResult {
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  meta: {
    rule: string;
    reasoning?: string;
  };
}

/**
 * Predict trading signal based on technical features
 * TODO: Replace with TensorFlow.js model
 */
export async function predictSignal(
  symbol: string, 
  features: Features
): Promise<PredictionResult> {
  const { smaFast, smaSlow, rsi, macd, volatility } = features;

  // Simple SMA crossover + RSI heuristic as baseline
  if (smaFast > smaSlow && rsi < 70 && volatility < 0.05) {
    return {
      action: 'buy',
      confidence: 0.62,
      meta: {
        rule: 'smaCross+rsi+volatility',
        reasoning: 'Bullish SMA crossover with RSI not overbought and low volatility'
      }
    };
  }

  if (smaFast < smaSlow && rsi > 30 && volatility < 0.05) {
    return {
      action: 'sell',
      confidence: 0.58,
      meta: {
        rule: 'smaCross+rsi+volatility',
        reasoning: 'Bearish SMA crossover with RSI not oversold and low volatility'
      }
    };
  }

  // MACD signal
  if (macd.macd > macd.signal && rsi < 80) {
    return {
      action: 'buy',
      confidence: 0.55,
      meta: {
        rule: 'macd+bullish',
        reasoning: 'MACD bullish crossover'
      }
    };
  }

  if (macd.macd < macd.signal && rsi > 20) {
    return {
      action: 'sell',
      confidence: 0.53,
      meta: {
        rule: 'macd+bearish',
        reasoning: 'MACD bearish crossover'
      }
    };
  }

  // Default hold
  return {
    action: 'hold',
    confidence: 0.51,
    meta: {
      rule: 'neutral',
      reasoning: 'No clear signal detected'
    }
  };
}
