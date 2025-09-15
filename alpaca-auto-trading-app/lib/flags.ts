export type FeatureFlags = {
  live: boolean;           // live trading
  screener: boolean;       // Discover/Screener
  backtest: boolean;       // Backtesting UI
  aiSignals: boolean;      // AI signals panel
  notifications: boolean;  // Push/email center
};

// Client-side hook for feature flags (for client components)
export function useClientFlags(): FeatureFlags {
  // In a real app, you'd fetch this from an API endpoint
  // For now, return defaults
  return {
    live: false,
    screener: true,
    backtest: true,
    aiSignals: true,
    notifications: true,
  };
}
