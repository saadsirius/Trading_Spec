'use client';

export default function WatchlistMini() {
  const watchlistItems = [
    { symbol: 'AAPL', price: 175.43, change: '+2.34', changePercent: '+1.35%' },
    { symbol: 'TSLA', price: 248.87, change: '-5.21', changePercent: '-2.05%' },
    { symbol: 'NVDA', price: 875.12, change: '+12.45', changePercent: '+1.44%' },
    { symbol: 'MSFT', price: 378.91, change: '+1.23', changePercent: '+0.33%' },
  ];

  return (
    <div className="glass p-4 rounded-xl">
      <h3 className="font-semibold text-lg mb-3">Watchlist</h3>
      <div className="space-y-2">
        {watchlistItems.map((item) => (
          <div key={item.symbol} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
            <div>
              <div className="font-medium">{item.symbol}</div>
              <div className="text-sm text-white/70">${item.price}</div>
            </div>
            <div className={`text-sm font-medium ${item.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {item.change} ({item.changePercent})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
