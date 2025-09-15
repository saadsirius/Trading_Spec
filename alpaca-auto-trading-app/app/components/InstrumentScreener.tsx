"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, TrendingUp, TrendingDown, 
  Star, Plus, Minus, Eye, EyeOff 
} from "lucide-react";
import GlassButton from "./GlassButton";
import WhyInvest from "./WhyInvest";

interface Instrument {
  id: string;
  symbol: string;
  name: string;
  type: string;
  sector?: string;
  region?: string;
  price: number;
  changePercent: number;
  volume?: number;
  avgVolume?: number;
  marketCap?: number;
  volatility?: number;
  liquidityScore?: number;
  tags: string[];
  sparkline?: number[];
}

interface FilterOptions {
  types: string[];
  sectors: string[];
  regions: string[];
  priceRange: [number, number];
  changeRange: [number, number];
  volatilityRange: [number, number];
  liquidityRange: [number, number];
}

interface InstrumentScreenerProps {
  instruments: Instrument[];
  onInstrumentSelect?: (instrument: Instrument) => void;
  onAddToWatchlist?: (instrument: Instrument) => void;
  className?: string;
}

export default function InstrumentScreener({ 
  instruments, 
  onInstrumentSelect,
  onAddToWatchlist,
  className = "" 
}: InstrumentScreenerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [watchlistItems, setWatchlistItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'volume' | 'marketCap' | 'volatility'>('change');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [filters, setFilters] = useState<FilterOptions>({
    types: [],
    sectors: [],
    regions: [],
    priceRange: [0, 10000],
    changeRange: [-100, 100],
    volatilityRange: [0, 1],
    liquidityRange: [0, 100],
  });

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const typesSet = new Set(instruments.map(i => i.type));
    const sectorsSet = new Set(instruments.map(i => i.sector).filter(Boolean));
    const regionsSet = new Set(instruments.map(i => i.region).filter(Boolean));
    
    return {
      types: Array.from(typesSet),
      sectors: Array.from(sectorsSet),
      regions: Array.from(regionsSet),
    };
  }, [instruments]);

  // Filter and sort instruments
  const filteredInstruments = useMemo(() => {
    let filtered = instruments.filter(instrument => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSymbol = instrument.symbol.toLowerCase().includes(query);
        const matchesName = instrument.name.toLowerCase().includes(query);
        const matchesTags = instrument.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesSymbol && !matchesName && !matchesTags) return false;
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(instrument.type)) {
        return false;
      }

      // Sector filter
      if (filters.sectors.length > 0 && (!instrument.sector || !filters.sectors.includes(instrument.sector))) {
        return false;
      }

      // Region filter
      if (filters.regions.length > 0 && (!instrument.region || !filters.regions.includes(instrument.region))) {
        return false;
      }

      // Price range filter
      if (instrument.price < filters.priceRange[0] || instrument.price > filters.priceRange[1]) {
        return false;
      }

      // Change range filter
      if (instrument.changePercent < filters.changeRange[0] || instrument.changePercent > filters.changeRange[1]) {
        return false;
      }

      // Volatility range filter
      if (instrument.volatility && (instrument.volatility < filters.volatilityRange[0] || instrument.volatility > filters.volatilityRange[1])) {
        return false;
      }

      // Liquidity range filter
      if (instrument.liquidityScore && (instrument.liquidityScore < filters.liquidityRange[0] || instrument.liquidityScore > filters.liquidityRange[1])) {
        return false;
      }

      return true;
    });

    // Sort instruments
    filtered.sort((a, b) => {
      let aValue = 0;
      let bValue = 0;

      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'change':
          aValue = a.changePercent;
          bValue = b.changePercent;
          break;
        case 'volume':
          aValue = a.volume || 0;
          bValue = b.volume || 0;
          break;
        case 'marketCap':
          aValue = a.marketCap || 0;
          bValue = b.marketCap || 0;
          break;
        case 'volatility':
          aValue = a.volatility || 0;
          bValue = b.volatility || 0;
          break;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [instruments, searchQuery, filters, sortBy, sortOrder]);

  const handleInstrumentClick = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    onInstrumentSelect?.(instrument);
  };

  const handleAddToWatchlist = (instrument: Instrument, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlistItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(instrument.id)) {
        newSet.delete(instrument.id);
      } else {
        newSet.add(instrument.id);
      }
      return newSet;
    });
    onAddToWatchlist?.(instrument);
  };

  const formatNumber = (num: number, type: 'price' | 'volume' | 'marketCap' | 'percent' = 'price') => {
    switch (type) {
      case 'price':
        return `$${num.toFixed(2)}`;
      case 'volume':
        if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
        return num.toString();
      case 'marketCap':
        if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
        return `$${num.toFixed(0)}`;
      case 'percent':
        return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
      default:
        return num.toString();
    }
  };

  const MiniSparkline = ({ data }: { data: number[] }) => {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    if (range === 0) return <div className="w-full h-4 bg-white/10 rounded"></div>;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    const isPositive = data[data.length - 1] > data[0];
    const color = isPositive ? '#10B981' : '#EF4444';

    return (
      <svg width="60" height="16" viewBox="0 0 60 16" className="flex-shrink-0">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className={`glass ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Instrument Screener</h2>
          <div className="flex items-center space-x-2">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </GlassButton>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search symbols, names, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-secondary/60 focus:border-transparent"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-white/60">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary/60"
            >
              <option value="change">Change %</option>
              <option value="price">Price</option>
              <option value="volume">Volume</option>
              <option value="marketCap">Market Cap</option>
              <option value="volatility">Volatility</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 hover:bg-white/10 rounded"
            >
              {sortOrder === 'asc' ? (
                <TrendingUp className="w-4 h-4 text-white/60" />
              ) : (
                <TrendingDown className="w-4 h-4 text-white/60" />
              )}
            </button>
          </div>
          <span className="text-sm text-white/60">
            {filteredInstruments.length} instruments
          </span>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Type</label>
                <div className="space-y-2">
                  {filterOptions.types.map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={(e) => {
                          setFilters(prev => ({
                            ...prev,
                            types: e.target.checked
                              ? [...prev.types, type]
                              : prev.types.filter(t => t !== type)
                          }));
                        }}
                        className="mr-2 rounded border-white/20 bg-white/10"
                      />
                      <span className="text-sm text-white/80">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sector Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Sector</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filterOptions.sectors.map(sector => (
                    <label key={sector} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.sectors.includes(sector || '')}
                        onChange={(e) => {
                          setFilters(prev => ({
                            ...prev,
                            sectors: e.target.checked
                              ? [...prev.sectors, sector || '']
                              : prev.sectors.filter(s => s !== sector)
                          }));
                        }}
                        className="mr-2 rounded border-white/20 bg-white/10"
                      />
                      <span className="text-sm text-white/80">{sector}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Range Filters */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Price Range</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [parseFloat(e.target.value) || 0, prev.priceRange[1]]
                      }))}
                      className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white"
                    />
                    <span className="text-white/60">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseFloat(e.target.value) || 10000]
                      }))}
                      className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-sm text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="max-h-96 overflow-y-auto">
        {filteredInstruments.map((instrument) => (
          <motion.div
            key={instrument.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            className="p-4 border-b border-white/5 cursor-pointer transition-colors"
            onClick={() => handleInstrumentClick(instrument)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {/* Symbol and Name */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white truncate">{instrument.symbol}</h3>
                    <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                      {instrument.type}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 truncate">{instrument.name}</p>
                </div>

                {/* Price and Change */}
                <div className="text-right">
                  <div className="text-white font-medium">
                    {formatNumber(instrument.price, 'price')}
                  </div>
                  <div className={`text-sm flex items-center ${
                    instrument.changePercent >= 0 ? 'text-support' : 'text-danger-400'
                  }`}>
                    {instrument.changePercent >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {formatNumber(instrument.changePercent, 'percent')}
                  </div>
                </div>

                {/* Sparkline */}
                <div className="flex items-center">
                  <MiniSparkline data={instrument.sparkline || []} />
                </div>

                {/* Volume */}
                {instrument.volume && (
                  <div className="text-right text-sm text-white/60">
                    <div>Vol: {formatNumber(instrument.volume, 'volume')}</div>
                  </div>
                )}

                {/* Watchlist Button */}
                <button
                  onClick={(e) => handleAddToWatchlist(instrument, e)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {watchlistItems.has(instrument.id) ? (
                    <Star className="w-4 h-4 text-accent fill-current" />
                  ) : (
                    <Star className="w-4 h-4 text-white/40" />
                  )}
                </button>
              </div>
            </div>

            {/* Tags */}
            {instrument.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {instrument.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
                {instrument.tags.length > 3 && (
                  <span className="text-xs text-white/50">
                    +{instrument.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}

        {filteredInstruments.length === 0 && (
          <div className="p-8 text-center text-white/60">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No instruments found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Why Invest Modal */}
      <AnimatePresence>
        {selectedInstrument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInstrument(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {selectedInstrument.symbol} - {selectedInstrument.name}
                  </h3>
                  <button
                    onClick={() => setSelectedInstrument(null)}
                    className="p-2 hover:bg-white/10 rounded-lg"
                  >
                    <Minus className="w-5 h-5 text-white/60" />
                  </button>
                </div>
                <WhyInvest instrument={selectedInstrument} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
