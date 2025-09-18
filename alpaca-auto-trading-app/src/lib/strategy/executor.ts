// Mock strategy executor for development
export const strategyExecutor = {
  execute: (strategy: any, data: any) => {
    console.log('StrategyExecutor: Executing strategy:', strategy);
    return { success: true, result: {} };
  }
};
