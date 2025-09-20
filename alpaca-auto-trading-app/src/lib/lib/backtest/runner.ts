import { BacktestingEngine } from './engine';

// Re-export the backtesting engine
export { BacktestingEngine } from './engine';

// Create a default instance
export const backtestingEngine = new BacktestingEngine();

// Register default strategies
backtestingEngine.registerDefaultStrategies();
