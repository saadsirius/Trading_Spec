import { describe, it, expect } from 'vitest';

// Mock PnL calculation functions
function calculateDailyPnL(trades: any[], date: string): number {
  return trades
    .filter(trade => trade.date === date)
    .reduce((sum, trade) => sum + (trade.pnl || 0), 0);
}

function calculateCumulativePnL(dailyPnL: { date: string; pnl: number }[]): number[] {
  let cumulative = 0;
  return dailyPnL.map(day => {
    cumulative += day.pnl;
    return cumulative;
  });
}

function calculateDrawdown(cumulativePnL: number[]): number[] {
  let peak = 0;
  return cumulativePnL.map(pnl => {
    if (pnl > peak) peak = pnl;
    return peak - pnl;
  });
}

function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
  if (returns.length === 0) return 0;
  
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return 0;
  
  return (avgReturn - riskFreeRate / 252) / stdDev * Math.sqrt(252); // Annualized
}

function calculateMaxDrawdown(drawdowns: number[]): number {
  return Math.max(...drawdowns);
}

function calculateWinRate(trades: any[]): number {
  if (trades.length === 0) return 0;
  const winningTrades = trades.filter(trade => (trade.pnl || 0) > 0).length;
  return winningTrades / trades.length;
}

function calculateExpectancy(trades: any[]): number {
  if (trades.length === 0) return 0;
  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  return totalPnL / trades.length;
}

describe('PnL Calculations', () => {
  const mockTrades = [
    { date: '2023-01-01', symbol: 'AAPL', pnl: 100, side: 'buy', quantity: 10, price: 150 },
    { date: '2023-01-01', symbol: 'AAPL', pnl: -50, side: 'sell', quantity: 5, price: 145 },
    { date: '2023-01-02', symbol: 'GOOGL', pnl: 200, side: 'buy', quantity: 2, price: 2500 },
    { date: '2023-01-02', symbol: 'MSFT', pnl: -75, side: 'sell', quantity: 3, price: 300 },
    { date: '2023-01-03', symbol: 'TSLA', pnl: 300, side: 'buy', quantity: 1, price: 200 },
    { date: '2023-01-03', symbol: 'NVDA', pnl: 150, side: 'buy', quantity: 2, price: 400 },
  ];

  const mockDailyPnL = [
    { date: '2023-01-01', pnl: 50 },
    { date: '2023-01-02', pnl: 125 },
    { date: '2023-01-03', pnl: 450 },
  ];

  describe('Daily PnL Calculation', () => {
    it('calculates daily PnL correctly', () => {
      const result = calculateDailyPnL(mockTrades, '2023-01-01');
      expect(result).toBe(50); // 100 + (-50)
    });

    it('returns 0 for date with no trades', () => {
      const result = calculateDailyPnL(mockTrades, '2023-01-04');
      expect(result).toBe(0);
    });

    it('handles empty trades array', () => {
      const result = calculateDailyPnL([], '2023-01-01');
      expect(result).toBe(0);
    });
  });

  describe('Cumulative PnL Calculation', () => {
    it('calculates cumulative PnL correctly', () => {
      const result = calculateCumulativePnL(mockDailyPnL);
      expect(result).toEqual([50, 175, 625]);
    });

    it('handles empty daily PnL array', () => {
      const result = calculateCumulativePnL([]);
      expect(result).toEqual([]);
    });

    it('handles single day', () => {
      const result = calculateCumulativePnL([{ date: '2023-01-01', pnl: 100 }]);
      expect(result).toEqual([100]);
    });
  });

  describe('Drawdown Calculation', () => {
    it('calculates drawdown correctly', () => {
      const cumulativePnL = [100, 150, 120, 180, 160, 200];
      const result = calculateDrawdown(cumulativePnL);
      expect(result).toEqual([0, 0, 30, 0, 20, 0]);
    });

    it('handles increasing PnL (no drawdown)', () => {
      const cumulativePnL = [100, 150, 200, 250];
      const result = calculateDrawdown(cumulativePnL);
      expect(result).toEqual([0, 0, 0, 0]);
    });

    it('handles decreasing PnL', () => {
      const cumulativePnL = [200, 150, 100, 50];
      const result = calculateDrawdown(cumulativePnL);
      expect(result).toEqual([0, 50, 100, 150]);
    });
  });

  describe('Sharpe Ratio Calculation', () => {
    it('calculates Sharpe ratio correctly', () => {
      const returns = [0.01, 0.02, -0.01, 0.03, 0.01];
      const result = calculateSharpeRatio(returns, 0.02);
      expect(result).toBeGreaterThan(0);
    });

    it('handles zero standard deviation', () => {
      const returns = [0.01, 0.01, 0.01, 0.01];
      const result = calculateSharpeRatio(returns);
      expect(result).toBe(0);
    });

    it('handles empty returns array', () => {
      const result = calculateSharpeRatio([]);
      expect(result).toBe(0);
    });
  });

  describe('Max Drawdown Calculation', () => {
    it('calculates max drawdown correctly', () => {
      const drawdowns = [0, 10, 30, 20, 0, 15];
      const result = calculateMaxDrawdown(drawdowns);
      expect(result).toBe(30);
    });

    it('handles no drawdowns', () => {
      const drawdowns = [0, 0, 0, 0];
      const result = calculateMaxDrawdown(drawdowns);
      expect(result).toBe(0);
    });

    it('handles empty drawdowns array', () => {
      const result = calculateMaxDrawdown([]);
      expect(result).toBe(-Infinity);
    });
  });

  describe('Win Rate Calculation', () => {
    it('calculates win rate correctly', () => {
      const result = calculateWinRate(mockTrades);
      expect(result).toBeCloseTo(0.67, 2); // 4 winning trades out of 6
    });

    it('handles all winning trades', () => {
      const winningTrades = [
        { pnl: 100 },
        { pnl: 200 },
        { pnl: 300 },
      ];
      const result = calculateWinRate(winningTrades);
      expect(result).toBe(1);
    });

    it('handles all losing trades', () => {
      const losingTrades = [
        { pnl: -100 },
        { pnl: -200 },
        { pnl: -300 },
      ];
      const result = calculateWinRate(losingTrades);
      expect(result).toBe(0);
    });

    it('handles empty trades array', () => {
      const result = calculateWinRate([]);
      expect(result).toBe(0);
    });
  });

  describe('Expectancy Calculation', () => {
    it('calculates expectancy correctly', () => {
      const result = calculateExpectancy(mockTrades);
      expect(result).toBeCloseTo(104.17, 2); // (50 + 125 + 450) / 6
    });

    it('handles empty trades array', () => {
      const result = calculateExpectancy([]);
      expect(result).toBe(0);
    });

    it('handles trades with zero PnL', () => {
      const zeroTrades = [
        { pnl: 0 },
        { pnl: 0 },
        { pnl: 0 },
      ];
      const result = calculateExpectancy(zeroTrades);
      expect(result).toBe(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles trades with undefined PnL', () => {
      const tradesWithUndefined = [
        { pnl: 100 },
        { pnl: undefined },
        { pnl: -50 },
      ];
      const result = calculateExpectancy(tradesWithUndefined);
      expect(result).toBeCloseTo(16.67, 2); // (100 + 0 + (-50)) / 3
    });

    it('handles trades with null PnL', () => {
      const tradesWithNull = [
        { pnl: 100 },
        { pnl: null },
        { pnl: -50 },
      ];
      const result = calculateExpectancy(tradesWithNull);
      expect(result).toBeCloseTo(16.67, 2); // (100 + 0 + (-50)) / 3
    });

    it('handles very large numbers', () => {
      const largeTrades = [
        { pnl: 1000000 },
        { pnl: -500000 },
        { pnl: 2000000 },
      ];
      const result = calculateExpectancy(largeTrades);
      expect(result).toBeCloseTo(833333.33, 2);
    });

    it('handles very small numbers', () => {
      const smallTrades = [
        { pnl: 0.001 },
        { pnl: -0.002 },
        { pnl: 0.003 },
      ];
      const result = calculateExpectancy(smallTrades);
      expect(result).toBeCloseTo(0.00067, 5);
    });
  });
});
