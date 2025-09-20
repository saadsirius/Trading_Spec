// lib/indicators.ts
export type Bar = { time: number; open: number; high: number; low: number; close: number; volume?: number };

export function sma(values: number[], n: number): number[] {
  const out: number[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= n) sum -= values[i - n];
    out.push(i >= n - 1 ? sum / n : NaN);
  }
  return out;
}

export function ema(values: number[], n: number): number[] {
  const out: number[] = [];
  const k = 2 / (n + 1);
  
  // Initialize with SMA for the first valid period
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += values[i];
  }
  let e = sum / n;
  
  for (let i = 0; i < values.length; i++) {
    if (i < n - 1) {
      out.push(NaN);
    } else if (i === n - 1) {
      // First EMA value is the SMA
      out.push(e);
    } else {
      // Subsequent EMA values
      e = values[i] * k + e * (1 - k);
      out.push(e);
    }
  }
  return out;
}

export function rsi(values: number[], n = 14): number[] {
  if (values.length < n + 1) return Array(values.length).fill(NaN);
  
  const out = Array(values.length).fill(NaN);
  let gain = 0, loss = 0;
  
  // Calculate initial gains and losses
  for (let i = 1; i <= n; i++) {
    const d = values[i] - values[i - 1];
    if (d >= 0) gain += d; else loss -= d;
  }
  
  let avgG = gain / n;
  let avgL = loss / n;
  
  // Calculate RSI for the first valid period
  if (avgL === 0) {
    out[n] = 100;
  } else {
    const rs = avgG / avgL;
    out[n] = 100 - 100 / (1 + rs);
  }
  
  // Calculate RSI for remaining periods
  for (let i = n + 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    const gain = Math.max(0, d);
    const loss = Math.max(0, -d);
    
    avgG = (avgG * (n - 1) + gain) / n;
    avgL = (avgL * (n - 1) + loss) / n;
    
    if (avgL === 0) {
      out[i] = 100;
    } else {
      const rs = avgG / avgL;
      out[i] = 100 - 100 / (1 + rs);
    }
  }
  
  return out;
}

export function atr(bars: Bar[], n = 14): number[] {
  const out = Array(bars.length).fill(NaN);
  let trSum = 0;
  for (let i = 1; i < bars.length; i++) {
    const h = bars[i].high, l = bars[i].low, c1 = bars[i - 1].close;
    const tr = Math.max(h - l, Math.abs(h - c1), Math.abs(l - c1));
    trSum += tr;
    if (i >= n) trSum -= ((): number => {
      const j = i - n + 1;
      const hh = bars[j - 1].high, ll = bars[j - 1].low, cc = bars[j - 2]?.close ?? bars[j - 1].open;
      return Math.max(hh - ll, Math.abs(hh - cc), Math.abs(ll - cc));
    })();
    out[i] = i >= n ? trSum / n : NaN;
  }
  return out;
}

export function calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
  const fastEMA = ema(prices, fastPeriod);
  const slowEMA = ema(prices, slowPeriod);
  
  const macdLine: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (!isNaN(fastEMA[i]) && !isNaN(slowEMA[i])) {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    } else {
      macdLine.push(NaN);
    }
  }
  
  // Create signal line with same length as macdLine
  const signalLine: number[] = [];
  const validMacdValues = macdLine.filter(val => !isNaN(val));
  const signalEMA = ema(validMacdValues, signalPeriod);
  
  let signalIndex = 0;
  for (let i = 0; i < macdLine.length; i++) {
    if (!isNaN(macdLine[i])) {
      if (signalIndex < signalEMA.length && !isNaN(signalEMA[signalIndex])) {
        signalLine.push(signalEMA[signalIndex]);
        signalIndex++;
      } else {
        signalLine.push(NaN);
      }
    } else {
      signalLine.push(NaN);
    }
  }
  
  const histogram: number[] = [];
  
  for (let i = 0; i < macdLine.length; i++) {
    if (!isNaN(macdLine[i]) && !isNaN(signalLine[i])) {
      histogram.push(macdLine[i] - signalLine[i]);
    } else {
      histogram.push(NaN);
    }
  }
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram: histogram
  };
}

export function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
  const middle = sma(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
    } else {
      // Calculate standard deviation for this period
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = slice.reduce((sum, price) => sum + price, 0) / period;
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upper.push(middle[i] + (standardDeviation * stdDev));
      lower.push(middle[i] - (standardDeviation * stdDev));
    }
  }
  
  return {
    upper: upper,
    middle: middle,
    lower: lower
  };
}

export function calculateStochastic(highs: number[], lows: number[], closes: number[], kPeriod: number = 14, dPeriod: number = 3) {
  const k: number[] = [];
  
  for (let i = 0; i < highs.length; i++) {
    if (i < kPeriod - 1) {
      k.push(NaN);
    } else {
      const sliceHighs = highs.slice(i - kPeriod + 1, i + 1);
      const sliceLows = lows.slice(i - kPeriod + 1, i + 1);
      const highest = Math.max(...sliceHighs);
      const lowest = Math.min(...sliceLows);
      
      if (highest !== lowest) {
        k.push(((closes[i] - lowest) / (highest - lowest)) * 100);
      } else {
        k.push(50); // Neutral when no range
      }
    }
  }
  
  // Create d line with same length as k
  const d: number[] = [];
  const validKValues = k.filter(val => !isNaN(val));
  const dSMA = sma(validKValues, dPeriod);
  
  let dIndex = 0;
  for (let i = 0; i < k.length; i++) {
    if (!isNaN(k[i])) {
      if (dIndex < dSMA.length && !isNaN(dSMA[dIndex])) {
        d.push(dSMA[dIndex]);
        dIndex++;
      } else {
        d.push(NaN);
      }
    } else {
      d.push(NaN);
    }
  }
  
  return { k, d };
}

export function calculateWilliamsR(highs: number[], lows: number[], closes: number[], period: number = 14): number[] {
  const williamsR: number[] = [];
  
  for (let i = 0; i < highs.length; i++) {
    if (i < period - 1) {
      williamsR.push(NaN);
    } else {
      const sliceHighs = highs.slice(i - period + 1, i + 1);
      const sliceLows = lows.slice(i - period + 1, i + 1);
      const highest = Math.max(...sliceHighs);
      const lowest = Math.min(...sliceLows);
      
      if (highest !== lowest) {
        williamsR.push(((highest - closes[i]) / (highest - lowest)) * -100);
      } else {
        williamsR.push(-50); // Neutral when no range
      }
    }
  }
  
  return williamsR;
}

export function calculateADX(highs: number[], lows: number[], closes: number[], period: number = 14): number[] {
  const tr: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  
  // Calculate True Range and Directional Movement
  for (let i = 0; i < highs.length; i++) {
    if (i === 0) {
      tr.push(highs[i] - lows[i]);
      plusDM.push(0);
      minusDM.push(0);
    } else {
      const tr1 = highs[i] - lows[i];
      const tr2 = Math.abs(highs[i] - closes[i - 1]);
      const tr3 = Math.abs(lows[i] - closes[i - 1]);
      tr.push(Math.max(tr1, tr2, tr3));
      
      const highDiff = highs[i] - highs[i - 1];
      const lowDiff = lows[i - 1] - lows[i];
      
      plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
      minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
    }
  }
  
  // Smooth TR, +DM, -DM
  const smoothedTR = sma(tr, period);
  const smoothedPlusDM = sma(plusDM, period);
  const smoothedMinusDM = sma(minusDM, period);
  
  // Calculate +DI, -DI, and ADX
  const plusDI: number[] = [];
  const minusDI: number[] = [];
  const adx: number[] = [];
  
  for (let i = 0; i < highs.length; i++) {
    if (i < period - 1) {
      plusDI.push(NaN);
      minusDI.push(NaN);
      adx.push(NaN);
    } else {
      const plusDIIndex = i - period + 1;
      const minusDIIndex = i - period + 1;
      
      if (smoothedTR[plusDIIndex] > 0) {
        plusDI.push((smoothedPlusDM[plusDIIndex] / smoothedTR[plusDIIndex]) * 100);
        minusDI.push((smoothedMinusDM[minusDIIndex] / smoothedTR[plusDIIndex]) * 100);
      } else {
        plusDI.push(0);
        minusDI.push(0);
      }
      
      // Calculate DX
      const sumDI = plusDI[plusDI.length - 1] + minusDI[minusDI.length - 1];
      const dx = sumDI > 0 ? Math.abs(plusDI[plusDI.length - 1] - minusDI[minusDI.length - 1]) / sumDI * 100 : 0;
      
      if (adx.length === 0 || isNaN(adx[adx.length - 1])) {
        adx.push(dx);
      } else {
        // Smooth DX to get ADX
        const prevADX = adx[adx.length - 1];
        adx.push((prevADX * (period - 1) + dx) / period);
      }
    }
  }
  
  return adx;
}

export function calculateParabolicSAR(highs: number[], lows: number[], acceleration: number = 0.02, maximum: number = 0.2): number[] {
  const sar: number[] = [];
  let trend = 1; // 1 for uptrend, -1 for downtrend
  let af = acceleration;
  let ep = highs[0]; // Extreme point
  let psar = lows[0]; // Previous SAR
  
  sar.push(psar);
  
  for (let i = 1; i < highs.length; i++) {
    // Calculate new SAR
    psar = psar + af * (ep - psar);
    
    // Check for trend reversal
    if (trend === 1) {
      // Uptrend
      if (lows[i] <= psar) {
        // Reversal to downtrend
        trend = -1;
        psar = ep;
        ep = lows[i];
        af = acceleration;
      } else {
        // Continue uptrend
        if (highs[i] > ep) {
          ep = highs[i];
          af = Math.min(af + acceleration, maximum);
        }
        psar = Math.min(psar, lows[i - 1], lows[i]);
      }
    } else {
      // Downtrend
      if (highs[i] >= psar) {
        // Reversal to uptrend
        trend = 1;
        psar = ep;
        ep = highs[i];
        af = acceleration;
      } else {
        // Continue downtrend
        if (lows[i] < ep) {
          ep = lows[i];
          af = Math.min(af + acceleration, maximum);
        }
        psar = Math.max(psar, highs[i - 1], highs[i]);
      }
    }
    
    sar.push(psar);
  }
  
  return sar;
}