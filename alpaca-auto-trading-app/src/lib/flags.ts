// Feature flags for the application
export type FeatureFlag = {
  name: string;
  enabled: boolean;
  description?: string;
};

// Default feature flags
const defaultFlags: FeatureFlag[] = [
  { name: 'ai_suggestions', enabled: true, description: 'AI suggestions and analysis' },
  { name: 'advanced_charts', enabled: true, description: 'Advanced charting features' },
  { name: 'real_time_data', enabled: true, description: 'Real-time market data' },
  { name: 'paper_trading', enabled: true, description: 'Paper trading mode' },
  { name: 'live_trading', enabled: false, description: 'Live trading mode' },
];

// Client-side feature flags hook
export function useClientFlags() {
  // In a real implementation, this would fetch flags from a server
  // For now, return the default flags
  return defaultFlags.reduce((acc, flag) => {
    acc[flag.name] = flag.enabled;
    return acc;
  }, {} as Record<string, boolean>);
}

// Server-side feature flags
export function getServerFlags(): Record<string, boolean> {
  return defaultFlags.reduce((acc, flag) => {
    acc[flag.name] = flag.enabled;
    return acc;
  }, {} as Record<string, boolean>);
}
