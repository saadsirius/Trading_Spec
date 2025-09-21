'use client';

export default function PortfolioMini() {
  const portfolio = {
    totalValue: 125430.50,
    dayChange: 2340.75,
    dayChangePercent: 1.90,
    positions: [
      { symbol: 'AAPL', shares: 50, value: 8771.50, change: '+234.50' },
      { symbol: 'TSLA', shares: 20, value: 4977.40, change: '-104.20' },
      { symbol: 'NVDA', shares: 10, value: 8751.20, change: '+124.50' },
    ]
  };

  return (
    <div className="glass p-4 rounded-xl">
      <h3 className="font-semibold text-lg mb-3">Portfolio</h3>
      
      <div className="mb-4">
        <div className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</div>
        <div className={`text-sm ${portfolio.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {portfolio.dayChange >= 0 ? '+' : ''}${portfolio.dayChange.toLocaleString()} 
          ({portfolio.dayChangePercent >= 0 ? '+' : ''}{portfolio.dayChangePercent}%)
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-white/70 mb-2">Top Positions</div>
        {portfolio.positions.map((position) => (
          <div key={position.symbol} className="flex justify-between items-center py-1">
            <div>
              <div className="font-medium text-sm">{position.symbol}</div>
              <div className="text-xs text-white/50">{position.shares} shares</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">${position.value.toLocaleString()}</div>
              <div className={`text-xs ${position.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {position.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
