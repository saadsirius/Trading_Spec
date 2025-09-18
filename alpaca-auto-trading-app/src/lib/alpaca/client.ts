// Mock Alpaca client for development
export const alpacaClient = {
  getBars: (symbols: string[], timeframe: string) => {
    console.log('AlpacaClient: Getting bars for:', symbols, timeframe);
    return Promise.resolve({ bars: {} });
  },
  createOrder: (order: any) => {
    console.log('AlpacaClient: Creating order:', order);
    return Promise.resolve({ id: 'mock-order-id' });
  }
};
