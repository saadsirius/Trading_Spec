// Mock AI signals for development
export const aiSignals = {
  generate: (symbol: string, data: any) => {
    console.log('AISignals: Generating signals for:', symbol);
    return Promise.resolve({ signals: [] });
  }
};
