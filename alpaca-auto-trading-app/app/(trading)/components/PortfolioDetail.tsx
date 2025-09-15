"use client";

interface PortfolioDetailProps {
  mode: 'paper' | 'live';
}

export function PortfolioDetail({ mode }: PortfolioDetailProps) {
  return (
    <div className="space-y-6">
      <div className="glass p-6">
        <h1 className="text-2xl font-bold text-white mb-4">
          {mode === 'live' ? 'Live' : 'Paper'} Portfolio
        </h1>
        <p className="text-white/80">
          {mode === 'live' 
            ? 'Manage your live trading portfolio and positions.'
            : 'Track your paper trading portfolio performance.'
          }
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Overview */}
        <div className="glass p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Portfolio Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/80">Total Value:</span>
              <span className="text-white font-medium">$10,025.42</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Cash:</span>
              <span className="text-white font-medium">$2,011.77</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Invested:</span>
              <span className="text-white font-medium">$8,013.65</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Day P&L:</span>
              <span className="text-support font-medium">+$35.21</span>
            </div>
          </div>
        </div>

        {/* Holdings */}
        <div className="glass p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Holdings</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">AAPL</div>
                <div className="text-sm text-white/60">Apple Inc.</div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">10 shares</div>
                <div className="text-support">+$25.00</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">TSLA</div>
                <div className="text-sm text-white/60">Tesla Inc.</div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">5 shares</div>
                <div className="text-danger-400">-$15.50</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="glass p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Performance</h2>
        <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
          <p className="text-white/60">Performance chart will be integrated here</p>
        </div>
      </div>
    </div>
  );
}
