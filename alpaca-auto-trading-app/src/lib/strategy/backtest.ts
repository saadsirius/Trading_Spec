// Mock backtest for development
export const backtest = {
  run: (strategy: any, data: any) => {
    console.log('Backtest: Running backtest for strategy:', strategy);
    return { 
      success: true, 
      results: {
        totalReturn: 0.15,
        sharpeRatio: 1.2,
        maxDrawdown: 0.05
      }
    };
  }
};
