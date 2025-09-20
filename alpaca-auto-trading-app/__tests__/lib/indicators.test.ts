import { describe, it, expect } from 'vitest';
import { 
  sma, 
  ema, 
  rsi, 
  atr, 
  calculateMACD, 
  calculateBollingerBands, 
  calculateStochastic,
  calculateWilliamsR,
  calculateADX,
  calculateParabolicSAR,
  type Bar 
} from '../../lib/indicators';

describe('Technical Indicators', () => {
  const testPrices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 111, 110, 112, 114, 113, 115];
  const testBars: Bar[] = [
    { time: 1, open: 100, high: 105, low: 98, close: 102 },
    { time: 2, open: 102, high: 107, low: 100, close: 105 },
    { time: 3, open: 105, high: 108, low: 103, close: 106 },
    { time: 4, open: 106, high: 110, low: 104, close: 108 },
    { time: 5, open: 108, high: 112, low: 106, close: 110 },
    { time: 6, open: 110, high: 113, low: 108, close: 111 },
    { time: 7, open: 111, high: 115, low: 109, close: 113 },
    { time: 8, open: 113, high: 116, low: 111, close: 114 },
    { time: 9, open: 114, high: 117, low: 112, close: 115 },
    { time: 10, open: 115, high: 118, low: 113, close: 116 },
  ];

  describe('SMA (Simple Moving Average)', () => {
    it('calculates simple moving average correctly', () => {
      const result = sma(testPrices, 5);
      
      expect(result).toHaveLength(testPrices.length);
      expect(result[0]).toBeNaN(); // First 4 values should be NaN
      expect(result[1]).toBeNaN();
      expect(result[2]).toBeNaN();
      expect(result[3]).toBeNaN();
      
      // 5th value should be average of first 5 prices
      expect(result[4]).toBeCloseTo((100 + 102 + 101 + 103 + 105) / 5, 2);
      
      // 6th value should be average of prices 2-6
      expect(result[5]).toBeCloseTo((102 + 101 + 103 + 105 + 104) / 5, 2);
    });

    it('handles edge cases', () => {
      const result = sma([], 5);
      expect(result).toEqual([]);
      
      const result2 = sma([100], 1);
      expect(result2).toEqual([100]);
    });
  });

  describe('EMA (Exponential Moving Average)', () => {
    it('calculates exponential moving average correctly', () => {
      const result = ema(testPrices, 5);
      
      expect(result).toHaveLength(testPrices.length);
      expect(result[0]).toBeNaN(); // First 4 values should be NaN
      expect(result[1]).toBeNaN();
      expect(result[2]).toBeNaN();
      expect(result[3]).toBeNaN();
      
      // 5th value should be SMA of first 5 prices
      expect(result[4]).toBeCloseTo((100 + 102 + 101 + 103 + 105) / 5, 2);
      
      // 6th value should be EMA calculation
      const k = 2 / (5 + 1);
      const expectedEMA6 = testPrices[5] * k + result[4] * (1 - k);
      expect(result[5]).toBeCloseTo(expectedEMA6, 2);
    });

    it('handles single value', () => {
      const result = ema([100], 1);
      expect(result).toEqual([100]);
    });
  });

  describe('RSI (Relative Strength Index)', () => {
    it('calculates RSI correctly', () => {
      const result = rsi(testPrices, 14);
      
      expect(result).toHaveLength(testPrices.length);
      
      // First 14 values should be NaN (need 14 periods for 14-period RSI)
      for (let i = 0; i < 14; i++) {
        expect(result[i]).toBeNaN();
      }
      
      // RSI values should be between 0 and 100
      for (let i = 14; i < result.length; i++) {
        if (!isNaN(result[i])) {
          expect(result[i]).toBeGreaterThanOrEqual(0);
          expect(result[i]).toBeLessThanOrEqual(100);
        }
      }
    });

    it('handles insufficient data', () => {
      const result = rsi([100, 102], 14);
      expect(result).toEqual([NaN, NaN]);
    });
  });

  describe('ATR (Average True Range)', () => {
    it('calculates ATR correctly', () => {
      const result = atr(testBars, 14);
      
      expect(result).toHaveLength(testBars.length);
      expect(result[0]).toBeNaN(); // First value should be NaN
      
      // ATR values should be positive
      for (let i = 1; i < result.length; i++) {
        if (!isNaN(result[i])) {
          expect(result[i]).toBeGreaterThan(0);
        }
      }
    });

    it('handles single bar', () => {
      const result = atr([testBars[0]], 14);
      expect(result).toEqual([NaN]);
    });
  });

  describe('MACD', () => {
    it('calculates MACD correctly', () => {
      const result = calculateMACD(testPrices, 12, 26, 9);
      
      expect(result).toHaveProperty('macd');
      expect(result).toHaveProperty('signal');
      expect(result).toHaveProperty('histogram');
      
      expect(result.macd).toHaveLength(testPrices.length);
      expect(result.signal).toHaveLength(testPrices.length);
      expect(result.histogram).toHaveLength(testPrices.length);
      
      // MACD line should have NaN values initially
      expect(result.macd[0]).toBeNaN();
      
      // Histogram should be MACD - Signal
      for (let i = 0; i < result.histogram.length; i++) {
        if (!isNaN(result.macd[i]) && !isNaN(result.signal[i])) {
          expect(result.histogram[i]).toBeCloseTo(result.macd[i] - result.signal[i], 2);
        }
      }
    });
  });

  describe('Bollinger Bands', () => {
    it('calculates Bollinger Bands correctly', () => {
      const result = calculateBollingerBands(testPrices, 20, 2);
      
      expect(result).toHaveProperty('upper');
      expect(result).toHaveProperty('middle');
      expect(result).toHaveProperty('lower');
      
      expect(result.upper).toHaveLength(testPrices.length);
      expect(result.middle).toHaveLength(testPrices.length);
      expect(result.lower).toHaveLength(testPrices.length);
      
      // Upper band should be above middle, lower should be below
      for (let i = 0; i < result.upper.length; i++) {
        if (!isNaN(result.upper[i]) && !isNaN(result.middle[i]) && !isNaN(result.lower[i])) {
          expect(result.upper[i]).toBeGreaterThan(result.middle[i]);
          expect(result.lower[i]).toBeLessThan(result.middle[i]);
        }
      }
    });
  });

  describe('Stochastic Oscillator', () => {
    it('calculates Stochastic correctly', () => {
      const highs = testBars.map(bar => bar.high);
      const lows = testBars.map(bar => bar.low);
      const closes = testBars.map(bar => bar.close);
      
      const result = calculateStochastic(highs, lows, closes, 14, 3);
      
      expect(result).toHaveProperty('k');
      expect(result).toHaveProperty('d');
      
      expect(result.k).toHaveLength(highs.length);
      expect(result.d).toHaveLength(highs.length);
      
      // K values should be between 0 and 100
      for (let i = 0; i < result.k.length; i++) {
        if (!isNaN(result.k[i])) {
          expect(result.k[i]).toBeGreaterThanOrEqual(0);
          expect(result.k[i]).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('Williams %R', () => {
    it('calculates Williams %R correctly', () => {
      const highs = testBars.map(bar => bar.high);
      const lows = testBars.map(bar => bar.low);
      const closes = testBars.map(bar => bar.close);
      
      const result = calculateWilliamsR(highs, lows, closes, 14);
      
      expect(result).toHaveLength(highs.length);
      
      // Williams %R values should be between -100 and 0
      for (let i = 0; i < result.length; i++) {
        if (!isNaN(result[i])) {
          expect(result[i]).toBeGreaterThanOrEqual(-100);
          expect(result[i]).toBeLessThanOrEqual(0);
        }
      }
    });
  });

  describe('ADX (Average Directional Index)', () => {
    it('calculates ADX correctly', () => {
      const highs = testBars.map(bar => bar.high);
      const lows = testBars.map(bar => bar.low);
      const closes = testBars.map(bar => bar.close);
      
      const result = calculateADX(highs, lows, closes, 14);
      
      expect(result).toHaveLength(highs.length);
      
      // ADX values should be between 0 and 100
      for (let i = 0; i < result.length; i++) {
        if (!isNaN(result[i])) {
          expect(result[i]).toBeGreaterThanOrEqual(0);
          expect(result[i]).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe('Parabolic SAR', () => {
    it('calculates Parabolic SAR correctly', () => {
      const highs = testBars.map(bar => bar.high);
      const lows = testBars.map(bar => bar.low);
      
      const result = calculateParabolicSAR(highs, lows, 0.02, 0.2);
      
      expect(result).toHaveLength(highs.length);
      
      // SAR values should be positive
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles empty arrays', () => {
      expect(sma([], 5)).toEqual([]);
      expect(ema([], 5)).toEqual([]);
      expect(rsi([], 14)).toEqual([]);
      expect(atr([], 14)).toEqual([]);
    });

    it('handles arrays shorter than period', () => {
      const shortArray = [100, 102];
      expect(sma(shortArray, 5)).toEqual([NaN, NaN]);
      expect(ema(shortArray, 5)).toEqual([NaN, NaN]);
      expect(rsi(shortArray, 14)).toEqual([NaN, NaN]);
    });

    it('handles invalid periods', () => {
      expect(() => sma(testPrices, 0)).not.toThrow();
      expect(() => sma(testPrices, -1)).not.toThrow();
    });
  });
});