'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
}

export default function DiscoverPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  const { data: stocks, isLoading } = useQuery({
    queryKey: ['discover-stocks', searchTerm, selectedSector],
    queryFn: async (): Promise<Stock[]> => {
      // Mock data for demonstration
      const mockStocks: Stock[] = [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          price: 175.50,
          change: 2.30,
          changePercent: 1.33,
          volume: 45000000,
          marketCap: 2750000000000,
          sector: 'Technology'
        },
        {
          symbol: 'TSLA',
          name: 'Tesla, Inc.',
          price: 245.80,
          change: -5.20,
          changePercent: -2.07,
          volume: 32000000,
          marketCap: 780000000000,
          sector: 'Automotive'
        },
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          price: 485.30,
          change: 12.50,
          changePercent: 2.64,
          volume: 28000000,
          marketCap: 1200000000000,
          sector: 'Technology'
        },
        {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          price: 378.90,
          change: 1.80,
          changePercent: 0.48,
          volume: 25000000,
          marketCap: 2800000000000,
          sector: 'Technology'
        },
        {
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          price: 142.20,
          change: -0.80,
          changePercent: -0.56,
          volume: 18000000,
          marketCap: 1800000000000,
          sector: 'Technology'
        },
        {
          symbol: 'AMZN',
          name: 'Amazon.com, Inc.',
          price: 155.40,
          change: 3.20,
          changePercent: 2.10,
          volume: 22000000,
          marketCap: 1600000000000,
          sector: 'Consumer Discretionary'
        }
      ];

      // Filter by search term and sector
      let filtered = mockStocks;
      
      if (searchTerm) {
        filtered = filtered.filter(stock => 
          stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedSector) {
        filtered = filtered.filter(stock => stock.sector === selectedSector);
      }

      return filtered;
    }
  });

  const sectors = ['Technology', 'Automotive', 'Consumer Discretionary', 'Healthcare', 'Financial'];

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Discover Stocks</h1>
        <div className="text-sm text-gray-400">
          🟢 Paper Trading Mode
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
              Search Stocks
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by symbol or name..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Sector
            </label>
            <select
              id="sector"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stocks Grid */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Available Stocks</h2>
        {isLoading ? (
          <div className="text-gray-400">Loading stocks...</div>
        ) : stocks && stocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((stock) => (
              <div key={stock.symbol} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{stock.symbol}</h3>
                    <p className="text-sm text-gray-400">{stock.name}</p>
                  </div>
                  <span className="text-xs bg-gray-600 px-2 py-1 rounded">{stock.sector}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="font-semibold">${stock.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Change:</span>
                    <span className={`font-semibold ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Volume:</span>
                    <span className="text-sm">{(stock.volume / 1000000).toFixed(1)}M</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Market Cap:</span>
                    <span className="text-sm">${(stock.marketCap / 1000000000).toFixed(1)}B</span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors">
                    View Details
                  </button>
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors">
                    Add to Watchlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-center py-8">
            No stocks found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}