'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { Search, Settings, Home, ArrowLeft, Bell, Menu, X } from 'lucide-react';

interface NavigationProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showSettings?: boolean;
  showHome?: boolean;
}

export const Navigation = ({ 
  title = "Trading Dashboard", 
  showBack = false, 
  showSearch = true, 
  showSettings = true,
  showHome = true 
}: NavigationProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      // Mock search results - in real app, this would call an API
      const mockResults = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: 2.35, changePercent: 1.58 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2750.00, change: -25.50, changePercent: -0.92 },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.80, change: 8.20, changePercent: 3.45 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 380.15, change: 5.25, changePercent: 1.40 },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3200.75, change: -15.25, changePercent: -0.47 },
      ].filter(item => 
        item.symbol.toLowerCase().includes(query.toLowerCase()) ||
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleAssetSelect = (asset: any) => {
    setSearchQuery('');
    setShowSearchResults(false);
    // In a real app, this would navigate to the asset or add to watchlist
    console.log('Selected asset:', asset);
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="space-y-2">
                <Link href="/" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link href="/trading" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                  <span>📈</span>
                  <span>Trading</span>
                </Link>
                <Link href="/settings" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Back button */}
              {showBack && (
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}

              {/* Title */}
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h1>

              {/* Trading mode indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Paper Trading</span>
              </div>
            </div>

            {/* Center - Search */}
            {showSearch && (
              <div className="flex-1 max-w-lg mx-4 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search assets (AAPL, GOOGL, etc.)"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((asset, index) => (
                      <button
                        key={index}
                        onClick={() => handleAssetSelect(asset)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{asset.symbol}</div>
                            <div className="text-sm text-gray-600">{asset.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">${asset.price.toFixed(2)}</div>
                            <div className={`text-sm ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)} ({asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-2">
                {showHome && (
                  <Link href="/">
                    <Button variant="primary" size="sm">
                      <Home className="w-4 h-4 mr-2" />
                      Home
                    </Button>
                  </Link>
                )}
                <Link href="/trading">
                  <Button variant="secondary" size="sm">
                    📈 Trading
                  </Button>
                </Link>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-md hover:bg-gray-100 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>

              {/* Settings */}
              {showSettings && (
                <Link href="/settings">
                  <Button variant="secondary" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
