// Mock useChartHandlers for development
export const useChartHandlers = () => {
  const onPriceClick = (price: number, symbol: string) => {
    console.log('Chart click:', { price, symbol });
  };

  const getLastPriceClick = () => {
    return { price: 150.00, symbol: 'AAPL', timestamp: Date.now() };
  };

  return {
    onPriceClick,
    getLastPriceClick
  };
};
