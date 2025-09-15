import Link from 'next/link';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Alpaca Auto-Trading
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Learn how to trade safely and effectively with our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Paper Trading</h3>
                <p className="text-gray-600 mb-6">
                  Start with paper trading using simulated money. Practice your strategies 
                  with real market data without any financial risk.
                </p>
                <ul className="text-left text-sm text-gray-600 space-y-2">
                  <li>• Use real market data and prices</li>
                  <li>• Practice with $100,000 virtual money</li>
                  <li>• Learn from mistakes safely</li>
                  <li>• Test different strategies</li>
                </ul>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Live Trading</h3>
                <p className="text-gray-600 mb-6">
                  When you're ready, switch to live trading with real money. 
                  Connect your Alpaca account and start trading with actual capital.
                </p>
                <ul className="text-left text-sm text-gray-600 space-y-2">
                  <li>• Connect your Alpaca brokerage account</li>
                  <li>• Trade with real money</li>
                  <li>• Access to all trading features</li>
                  <li>• Real-time execution and settlement</li>
                </ul>
              </div>
            </Card>
          </div>

          <div className="bg-white rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">⚠️</span>
                </div>
                <h4 className="font-semibold mb-2">Position Sizing</h4>
                <p className="text-sm text-gray-600">
                  Never risk more than 1-2% of your account on a single trade.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🛡️</span>
                </div>
                <h4 className="font-semibold mb-2">Stop Losses</h4>
                <p className="text-sm text-gray-600">
                  Always set stop losses to limit your downside risk.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📈</span>
                </div>
                <h4 className="font-semibold mb-2">Diversification</h4>
                <p className="text-sm text-gray-600">
                  Don't put all your eggs in one basket. Diversify your portfolio.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/trading">
              <Button size="lg" className="mr-4">
                Start Trading Now
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
