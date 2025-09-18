import { Candle, BacktestTrade, BacktestMetrics, EquityPoint } from '@/lib/core/domain';

// ============================================================================
// BACKTESTING ENGINE
// ============================================================================

export type Bar = { 
  t: number;  // timestamp
  o: number;  // open
  h: number;  // high
  l: number;  // low
  c: number;  // close
  v: number;  // volume
};

export type Trade = { 
  entry: number; 
  exit?: number; 
  qty: number; 
  tIn: number; 
  tOut?: number;
  reason?: string;
};

export type Strategy = (bars: Bar[], params: Record<string, number>) => Trade[];

export interface BacktestConfig {
  initialCapital: number;
  commission: number;        // per trade commission
  slippage: number;         // slippage percentage
  maxPositionSize: number;  // max % of capital per position
  stopLoss?: number;        // stop loss percentage
  takeProfit?: number;      // take profit percentage
}

export interface BacktestResult {
  equity: EquityPoint[];
  trades: BacktestTrade[];
  metrics: BacktestMetrics;
  config: BacktestConfig;
}

// ============================================================================
// CORE BACKTESTING FUNCTION
// ============================================================================

export function simulate(
  bars: Bar[], 
  trades: Trade[], 
  config: BacktestConfig = {
    initialCapital: 100000,
    commission: 0.001, // 0.1%
    slippage: 0.0005,  // 0.05%
    maxPositionSize: 0.1, // 10%
  }
): BacktestResult {
  if (bars.length === 0 || trades.length === 0) {
    return createEmptyResult(config);
  }

  const equity: EquityPoint[] = [];
  const backtestTrades: BacktestTrade[] = [];
  let currentCapital = config.initialCapital;
  let currentPosition = 0;
  let currentPrice = 0;
  let maxEquity = config.initialCapital;
  let maxDrawdown = 0;

  // Sort trades by entry time
  const sortedTrades = [...trades].sort((a, b) => a.tIn - b.tIn);
  
  // Create bar lookup for quick price access
  const barMap = new Map<number, Bar>();
  bars.forEach(bar => {
    barMap.set(bar.t, bar);
  });

  // Process each trade
  for (const trade of sortedTrades) {
    const entryBar = barMap.get(trade.tIn);
    if (!entryBar) continue;

    const entryPrice = applySlippage(trade.entry, config.slippage, trade.qty > 0);
    const positionValue = Math.abs(trade.qty) * entryPrice;
    
    // Check position size limit
    if (positionValue > currentCapital * config.maxPositionSize) {
      continue; // Skip trade if too large
    }

    // Calculate exit price and time
    let exitPrice = trade.exit;
    let exitTime = trade.tOut;
    
    if (!exitPrice || !exitTime) {
      // Find next bar for exit
      const nextBar = findNextBar(bars, trade.tIn);
      if (!nextBar) continue;
      
      exitPrice = nextBar.c;
      exitTime = nextBar.t;
    }

    exitPrice = applySlippage(exitPrice, config.slippage, trade.qty < 0);

    // Calculate trade P&L
    const pnl = trade.qty * (exitPrice - entryPrice);
    const commission = positionValue * config.commission * 2; // Entry + exit
    const netPnl = pnl - commission;

    // Update capital
    currentCapital += netPnl;
    currentPosition = 0; // Assume we close position
    currentPrice = exitPrice;

    // Update max equity and drawdown
    maxEquity = Math.max(maxEquity, currentCapital);
    const currentDrawdown = (maxEquity - currentCapital) / maxEquity;
    maxDrawdown = Math.max(maxDrawdown, currentDrawdown);

    // Create backtest trade record
    const backtestTrade: BacktestTrade = {
      id: crypto.randomUUID(),
      symbol: 'UNKNOWN', // Will be set by caller
      side: trade.qty > 0 ? 'buy' : 'sell',
      entryPrice,
      exitPrice,
      quantity: Math.abs(trade.qty),
      entryTime: trade.tIn,
      exitTime,
      pnl: netPnl,
      pnlPercent: netPnl / (Math.abs(trade.qty) * entryPrice),
      fees: commission,
      slippage: Math.abs(trade.entry - entryPrice) + Math.abs((trade.exit || 0) - exitPrice),
      reason: trade.reason || 'Strategy signal',
    };

    backtestTrades.push(backtestTrade);

    // Add equity point
    equity.push({
      timestamp: exitTime,
      equity: currentCapital,
      drawdown: currentDrawdown,
    });
  }

  // Calculate metrics
  const metrics = calculateMetrics(backtestTrades, config.initialCapital, maxDrawdown);

  return {
    equity,
    trades: backtestTrades,
    metrics,
    config,
  };
}

// ============================================================================
// STRATEGY EXAMPLES
// ============================================================================

export const strategies = {
  // Simple Moving Average Crossover
  smaCrossover: (bars: Bar[], params: Record<string, number>): Trade[] => {
    const { fastPeriod = 10, slowPeriod = 20 } = params;
    const trades: Trade[] = [];
    
    if (bars.length < slowPeriod) return trades;

    let position = 0;
    let lastFastSMA = 0;
    let lastSlowSMA = 0;

    for (let i = slowPeriod; i < bars.length; i++) {
      const fastSMA = calculateSMA(bars, i - fastPeriod + 1, fastPeriod);
      const slowSMA = calculateSMA(bars, i - slowPeriod + 1, slowPeriod);

      if (i > slowPeriod) {
        // Check for crossover
        if (lastFastSMA <= lastSlowSMA && fastSMA > slowSMA && position <= 0) {
          // Bullish crossover - buy
          trades.push({
            entry: bars[i].c,
            qty: 100,
            tIn: bars[i].t,
            reason: `SMA crossover: ${fastPeriod} > ${slowPeriod}`,
          });
          position = 100;
        } else if (lastFastSMA >= lastSlowSMA && fastSMA < slowSMA && position >= 0) {
          // Bearish crossover - sell
          trades.push({
            entry: bars[i].c,
            qty: -100,
            tIn: bars[i].t,
            reason: `SMA crossover: ${fastPeriod} < ${slowPeriod}`,
          });
          position = -100;
        }
      }

      lastFastSMA = fastSMA;
      lastSlowSMA = slowSMA;
    }

    return trades;
  },

  // RSI Mean Reversion
  rsiMeanReversion: (bars: Bar[], params: Record<string, number>): Trade[] => {
    const { rsiPeriod = 14, oversold = 30, overbought = 70 } = params;
    const trades: Trade[] = [];
    
    if (bars.length < rsiPeriod) return trades;

    let position = 0;

    for (let i = rsiPeriod; i < bars.length; i++) {
      const rsi = calculateRSI(bars, i - rsiPeriod + 1, rsiPeriod);

      if (rsi < oversold && position <= 0) {
        // Oversold - buy
        trades.push({
          entry: bars[i].c,
          qty: 100,
          tIn: bars[i].t,
          reason: `RSI oversold: ${rsi.toFixed(1)} < ${oversold}`,
        });
        position = 100;
      } else if (rsi > overbought && position >= 0) {
        // Overbought - sell
        trades.push({
          entry: bars[i].c,
          qty: -100,
          tIn: bars[i].t,
          reason: `RSI overbought: ${rsi.toFixed(1)} > ${overbought}`,
        });
        position = -100;
      }
    }

    return trades;
  },

  // Buy and Hold
  buyAndHold: (bars: Bar[], params: Record<string, number>): Trade[] => {
    if (bars.length < 2) return [];
    
    return [{
      entry: bars[0].c,
      exit: bars[bars.length - 1].c,
      qty: 100,
      tIn: bars[0].t,
      tOut: bars[bars.length - 1].t,
      reason: 'Buy and hold strategy',
    }];
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function applySlippage(price: number, slippage: number, isBuy: boolean): number {
  const slippageAmount = price * slippage;
  return isBuy ? price + slippageAmount : price - slippageAmount;
}

function findNextBar(bars: Bar[], timestamp: number): Bar | null {
  return bars.find(bar => bar.t > timestamp) || null;
}

function calculateSMA(bars: Bar[], startIndex: number, period: number): number {
  let sum = 0;
  for (let i = startIndex; i < startIndex + period; i++) {
    sum += bars[i].c;
  }
  return sum / period;
}

function calculateRSI(bars: Bar[], startIndex: number, period: number): number {
  let gains = 0;
  let losses = 0;

  for (let i = startIndex + 1; i < startIndex + period; i++) {
    const change = bars[i].c - bars[i - 1].c;
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMetrics(
  trades: BacktestTrade[], 
  initialCapital: number, 
  maxDrawdown: number
): BacktestMetrics {
  if (trades.length === 0) {
    return {
      totalReturn: 0,
      annualizedReturn: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      maxDrawdown: 0,
      maxDrawdownDuration: 0,
      winRate: 0,
      profitFactor: 0,
      totalTrades: 0,
      avgTradeDuration: 0,
      volatility: 0,
      calmarRatio: 0,
    };
  }

  const totalReturn = (trades[trades.length - 1]?.pnl || 0) / initialCapital;
  const winningTrades = trades.filter(t => t.pnl && t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl && t.pnl < 0);
  
  const winRate = winningTrades.length / trades.length;
  const avgWin = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length;
  const avgLoss = losingTrades.reduce((sum, t) => sum + Math.abs(t.pnl || 0), 0) / losingTrades.length;
  
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
  
  // Calculate volatility (simplified)
  const returns = trades.map(t => (t.pnl || 0) / initialCapital);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance);
  
  const sharpeRatio = volatility > 0 ? avgReturn / volatility : 0;
  const sortinoRatio = sharpeRatio; // Simplified - same as Sharpe for now
  const calmarRatio = maxDrawdown > 0 ? totalReturn / maxDrawdown : 0;

  return {
    totalReturn,
    annualizedReturn: totalReturn, // Simplified - assume 1 year
    sharpeRatio,
    sortinoRatio,
    maxDrawdown,
    maxDrawdownDuration: 0, // Would need more complex calculation
    winRate,
    profitFactor,
    totalTrades: trades.length,
    avgTradeDuration: 0, // Would need to calculate from entry/exit times
    volatility,
    calmarRatio,
  };
}

function createEmptyResult(config: BacktestConfig): BacktestResult {
  return {
    equity: [],
    trades: [],
    metrics: {
      totalReturn: 0,
      annualizedReturn: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      maxDrawdown: 0,
      maxDrawdownDuration: 0,
      winRate: 0,
      profitFactor: 0,
      totalTrades: 0,
      avgTradeDuration: 0,
      volatility: 0,
      calmarRatio: 0,
    },
    config,
  };
}