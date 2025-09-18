import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">
            Welcome to Alpaca Trading Platform
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Professional trading platform with portfolio management, factor analysis, 
            and real-time market data integration.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Link 
              href="/portfolio"
              className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Portfolio</h3>
              <p className="text-gray-400 text-sm">
                View your positions, P&L, and equity curve
              </p>
            </Link>
            
            <Link 
              href="/history"
              className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-lg font-semibold mb-2">History</h3>
              <p className="text-gray-400 text-sm">
                Track your trading history and performance
              </p>
            </Link>
            
            <Link 
              href="/screener"
              className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">Screener</h3>
              <p className="text-gray-400 text-sm">
                Filter stocks by momentum, value, quality factors
              </p>
            </Link>
            
            <Link 
              href="/pentagon"
              className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div className="text-3xl mb-4">⭐</div>
              <h3 className="text-lg font-semibold mb-2">Pentagon</h3>
              <p className="text-gray-400 text-sm">
                Analyze stocks with factor radar charts
              </p>
            </Link>
          </div>
          
          <div className="mt-12 p-6 bg-gray-800 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <div className="text-left space-y-2 text-gray-300">
              <p>1. Configure your Alpaca API keys in <code className="bg-gray-700 px-2 py-1 rounded">.env.local</code></p>
              <p>2. Run <code className="bg-gray-700 px-2 py-1 rounded">npx prisma db push</code> to set up the database</p>
              <p>3. Start the development server with <code className="bg-gray-700 px-2 py-1 rounded">npm run dev</code></p>
              <p>4. Begin exploring your portfolio and analyzing stocks!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}