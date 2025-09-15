import { sma, ema, rsi, atr, Bar } from '../../lib/indicators';

describe('Technical Indicators', () => {
  describe('SMA', () => {
    test('calculates simple moving average correctly', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = sma(values, 3);
      
      expect(result[0]).toBeNaN();
      expect(result[1]).toBeNaN();
      expect(result[2]).toBeCloseTo(2, 5); // (1+2+3)/3
      expect(result[3]).toBeCloseTo(3, 5); // (2+3+4)/3
      expect(result[9]).toBeCloseTo(9, 5); // (8+9+10)/3
    });
  });

  describe('EMA', () => {
    test('calculates exponential moving average correctly', () => {
      const values = [1, 2, 3, 4, 5];
      const result = ema(values, 3);
      
      expect(result[0]).toBeNaN();
      expect(result[1]).toBeNaN();
      expect(result[2]).toBeCloseTo(2, 1); // First EMA value (average of first 3: 1,2,3 = 2)
      expect(result[4]).toBeGreaterThanOrEqual(4); // EMA should be close to or higher than SMA
    });
  });

  describe('RSI', () => {
    test('calculates RSI correctly for trending data', () => {
      // Need more data points for RSI calculation
      const values = Array.from({ length: 20 }, (_, i) => 10 + i);
      const result = rsi(values, 14);
      
      // Should be high RSI for uptrending data
      const lastValue = result[result.length - 1];
      expect(lastValue).not.toBeNaN();
      expect(lastValue).toBeGreaterThan(70);
    });

    test('calculates RSI correctly for declining data', () => {
      // Need more data points for RSI calculation
      const values = Array.from({ length: 20 }, (_, i) => 30 - i);
      const result = rsi(values, 14);
      
      // Should be low RSI for downtrending data
      const lastValue = result[result.length - 1];
      expect(lastValue).not.toBeNaN();
      expect(lastValue).toBeLessThan(30);
    });
  });

  describe('ATR', () => {
    test('calculates ATR correctly', () => {
      const bars: Bar[] = [
        { time: 1, open: 100, high: 105, low: 98, close: 102 },
        { time: 2, open: 102, high: 108, low: 100, close: 106 },
        { time: 3, open: 106, high: 110, low: 104, close: 108 },
      ];
      
      const result = atr(bars, 2);
      
      expect(result[0]).toBeNaN();
      expect(result[1]).toBeNaN();
      expect(result[2]).toBeGreaterThan(0);
    });
  });
});
