// Mock MarketDataService for development
export const marketData = {
  start: (symbols: string[]) => {
    console.log('MarketDataService: Starting for symbols:', symbols);
  },
  stop: () => {
    console.log('MarketDataService: Stopped');
  },
  getPrice: (symbol: string) => {
    return Math.random() * 100 + 50; // Mock price
  }
};
