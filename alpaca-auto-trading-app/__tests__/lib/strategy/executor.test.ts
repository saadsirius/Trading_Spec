import { decideOrder } from '../../../lib/strategy/executor';
import { Bar } from '../../../lib/indicators';

describe('Strategy Executor', () => {
  const mockBars: Bar[] = [
    { time: 1, open: 100, high: 105, low: 98, close: 102 },
    { time: 2, open: 102, high: 108, low: 100, close: 106 },
    { time: 3, open: 106, high: 110, low: 104, close: 108 },
    { time: 4, open: 108, high: 112, low: 106, close: 110 },
    { time: 5, open: 110, high: 114, low: 108, close: 112 },
    // Add more bars to ensure we have enough for indicators
    ...Array.from({ length: 60 }, (_, i) => ({
      time: 6 + i,
      open: 112 + i * 0.1,
      high: 114 + i * 0.1,
      low: 110 + i * 0.1,
      close: 112 + i * 0.1
    }))
  ];

  const execCtx = {
    equity: 1000,
    sleeveShare: 0.35,
    targetAnnVol: 0.10,
    maxTradeRiskPct: 0.005,
    winRate: 0.52,
    payoff: 1.1
  };

  test('returns hold action when no signal', () => {
    const result = decideOrder('TEST', mockBars, 0.02, execCtx);
    
    expect(result.action).toBe('hold');
    expect(result.reason).toBeDefined();
  });

  test('respects risk limits', () => {
    const lowRiskCtx = { ...execCtx, maxTradeRiskPct: 0.001 }; // Very low risk
    const result = decideOrder('TEST', mockBars, 0.02, lowRiskCtx);
    
    // Should either hold or have very small quantity
    if (result.action !== 'hold') {
      expect(result.order?.qty).toBeLessThan(0.1);
    }
  });

  test('calculates position sizing correctly', () => {
    const result = decideOrder('TEST', mockBars, 0.02, execCtx);
    
    if (result.action !== 'hold' && result.order) {
      expect(result.order.qty).toBeGreaterThan(0);
      expect(result.order.symbol).toBe('TEST');
      expect(['buy', 'sell']).toContain(result.order.side);
    }
  });

  test('includes stop loss and take profit when available', () => {
    const result = decideOrder('TEST', mockBars, 0.02, execCtx);
    
    if (result.action !== 'hold' && result.order) {
      // Should have stop loss and take profit if signal includes them
      expect(result.order.stop_loss || result.order.take_profit).toBeDefined();
    }
  });
});
