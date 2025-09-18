// Mock RiskService for development
export const risk = {
  getState: () => ({
    exposure: 0.5,
    maxDrawdown: 0.1,
    volatility: 0.2
  }),
  calculate: (symbol: string, amount: number) => {
    return {
      risk: Math.random() * 0.1,
      recommendation: 'moderate'
    };
  }
};
