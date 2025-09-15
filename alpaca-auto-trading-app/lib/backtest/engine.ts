export interface BacktestConfig {
  strategy: string;
  symbol: string;
  timeframe: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
}

export interface BacktestResult {
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalReturnPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  exposure: number;
}

export interface Trade {
  timestamp: Date;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  value: number;
  pnl?: number;
}

export class BacktestingEngine {
  private strategies: Map<string, any> = new Map();

  constructor() {
    this.registerDefaultStrategies();
  }

  registerDefaultStrategies(): void {
    // SMA Crossover Strategy
    this.strategies.set('sma_crossover', {
      name: 'SMA Crossover',
      description: 'Buy when fast SMA crosses above slow SMA, sell when it crosses below',
      parameters: {
        fastPeriod: 10,
        slowPeriod: 20,
      },
      execute: (data: any[], params: any) => {
        // Implementation would go here
        return [];
      },
    });

    // RSI Mean Reversion Strategy
    this.strategies.set('rsi_mean_reversion', {
      name: 'RSI Mean Reversion',
      description: 'Buy when RSI < 30, sell when RSI > 70',
      parameters: {
        rsiPeriod: 14,
        oversold: 30,
        overbought: 70,
      },
      execute: (data: any[], params: any) => {
        // Implementation would go here
        return [];
      },
    });

    // MACD Strategy
    this.strategies.set('macd', {
      name: 'MACD Strategy',
      description: 'Buy when MACD line crosses above signal line, sell when it crosses below',
      parameters: {
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
      },
      execute: (data: any[], params: any) => {
        // Implementation would go here
        return [];
      },
    });
  }

  async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
    const strategy = this.strategies.get(config.strategy);
    if (!strategy) {
      throw new Error(`Strategy '${config.strategy}' not found`);
    }

    // Mock implementation - in real app, you'd fetch historical data
    // and run the actual strategy
    const mockResult: BacktestResult = {
      initialCapital: config.initialCapital,
      finalCapital: config.initialCapital * 1.15, // 15% return
      totalReturn: config.initialCapital * 0.15,
      totalReturnPercent: 15.0,
      maxDrawdown: config.initialCapital * 0.05, // 5% max drawdown
      maxDrawdownPercent: 5.0,
      sharpeRatio: 1.2,
      winRate: 0.65, // 65% win rate
      totalTrades: 45,
      winningTrades: 29,
      losingTrades: 16,
      avgWin: config.initialCapital * 0.02,
      avgLoss: config.initialCapital * 0.015,
      profitFactor: 1.8,
      exposure: 0.85, // 85% market exposure
    };

    return mockResult;
  }

  getAvailableStrategies(): Array<{ id: string; name: string; description: string }> {
    return Array.from(this.strategies.entries()).map(([id, strategy]) => ({
      id,
      name: strategy.name,
      description: strategy.description,
    }));
  }
}

export const backtestingEngine = new BacktestingEngine();
