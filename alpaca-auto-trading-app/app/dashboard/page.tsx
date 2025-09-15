"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, TrendingUp, TrendingDown, 
  Search, Filter, Star, Bell,
  Settings, User, LogOut
} from "lucide-react";
import GlassButton from "../components/GlassButton";
import InstrumentScreener from "../components/InstrumentScreener";
import { PortfolioDetail } from "../(trading)/components/PortfolioDetail";
import WhyInvest from "../components/WhyInvest";

interface DashboardData {
  instruments: any[];
  portfolioData: any[];
  aiSignals: any[];
  watchlist: any[];
  user: {
    id: string;
    name: string;
    email: string;
    mode: 'paper' | 'live';
  };
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'discover' | 'portfolio' | 'signals'>('discover');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInstrument, setSelectedInstrument] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [instrumentsRes, portfolioRes, signalsRes] = await Promise.all([
        fetch('/api/discover?limit=100'),
        fetch('/api/portfolio?userId=demo&mode=paper'),
        fetch('/api/signals?userId=demo&limit=10')
      ]);

      const [instruments, portfolio, signals] = await Promise.all([
        instrumentsRes.json(),
        portfolioRes.json(),
        signalsRes.json()
      ]);

      setDashboardData({
        instruments: instruments.instruments || [],
        portfolioData: portfolio.portfolioData || [],
        aiSignals: signals.signals || [],
        watchlist: [], // Would be fetched from watchlist API
        user: {
          id: 'demo',
          name: 'Demo User',
          email: 'demo@example.com',
          mode: 'paper'
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAISignals = async () => {
    try {
      await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo',
          generateForAll: true,
          timeframe: '1D'
        })
      });
      
      // Refresh signals
      const signalsRes = await fetch('/api/signals?userId=demo&limit=10');
      const signals = await signalsRes.json();
      
      setDashboardData(prev => prev ? {
        ...prev,
        aiSignals: signals.signals || []
      } : null);
    } catch (error) {
      console.error('Error generating AI signals:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-white/80">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 text-center">
          <p className="text-white/80">Failed to load dashboard data</p>
          <GlassButton onClick={fetchDashboardData} className="mt-4">
            Retry
          </GlassButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* Header */}
      <header className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Trading Dashboard</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                dashboardData.user.mode === 'live' 
                  ? 'bg-accent/20 text-accent' 
                  : 'bg-secondary/20 text-secondary'
              }`}>
                {dashboardData.user.mode === 'live' ? 'Live Trading' : 'Paper Trading'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <GlassButton variant="secondary" size="sm" onClick={generateAISignals}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate AI Signals
              </GlassButton>
              
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-white/60" />
              </button>
              
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-white/60" />
              </button>
              
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <User className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-1 bg-white/5 rounded-xl p-1">
          {[
            { id: 'discover', label: 'Discover', icon: Search },
            { id: 'portfolio', label: 'Portfolio', icon: BarChart3 },
            { id: 'signals', label: 'AI Signals', icon: TrendingUp },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === id
                  ? 'bg-secondary/20 text-secondary'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'discover' && (
            <div className="space-y-6">
              <InstrumentScreener
                instruments={dashboardData.instruments}
                onInstrumentSelect={setSelectedInstrument}
                className="mb-6"
              />
              
              {selectedInstrument && (
                <WhyInvest instrument={selectedInstrument} />
              )}
            </div>
          )}

          {activeTab === 'portfolio' && (
            <PortfolioDetail
              mode={dashboardData.user.mode}
            />
          )}

          {activeTab === 'signals' && (
            <AISignalsPanel signals={dashboardData.aiSignals} />
          )}
        </motion.div>
      </main>
    </div>
  );
}

// AI Signals Panel Component
function AISignalsPanel({ signals }: { signals: any[] }) {
  const [filteredSignals, setFilteredSignals] = useState(signals);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');

  useEffect(() => {
    if (filter === 'all') {
      setFilteredSignals(signals);
    } else {
      setFilteredSignals(signals.filter(signal => signal.signalType.toLowerCase() === filter));
    }
  }, [signals, filter]);

  const getSignalColor = (signalType: string) => {
    switch (signalType.toLowerCase()) {
      case 'buy': return 'text-support';
      case 'sell': return 'text-danger-400';
      default: return 'text-white/60';
    }
  };

  const getSignalBgColor = (signalType: string) => {
    switch (signalType.toLowerCase()) {
      case 'buy': return 'bg-support/20';
      case 'sell': return 'bg-danger-500/20';
      default: return 'bg-white/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Signals Header */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">AI Trading Signals</h2>
          <div className="flex items-center space-x-2">
            {(['all', 'buy', 'sell'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === filterType
                    ? 'bg-secondary/20 text-secondary'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {filterType}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{signals.length}</div>
            <div className="text-sm text-white/60">Total Signals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-support">
              {signals.filter(s => s.signalType === 'BUY').length}
            </div>
            <div className="text-sm text-white/60">Buy Signals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-danger-400">
              {signals.filter(s => s.signalType === 'SELL').length}
            </div>
            <div className="text-sm text-white/60">Sell Signals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {signals.length > 0 ? Math.round(signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length) : 0}%
            </div>
            <div className="text-sm text-white/60">Avg Confidence</div>
          </div>
        </div>
      </div>

      {/* Signals List */}
      <div className="glass">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Recent Signals</h3>
        </div>
        
        <div className="divide-y divide-white/5">
          {filteredSignals.map((signal) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSignalBgColor(signal.signalType)} ${getSignalColor(signal.signalType)}`}>
                    {signal.signalType}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white">{signal.symbol}</h4>
                    <p className="text-sm text-white/60">{signal.name}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-medium">
                      ${signal.currentPrice?.toFixed(2) || 'N/A'}
                    </div>
                    <div className={`text-sm ${signal.priceChange >= 0 ? 'text-support' : 'text-danger-400'}`}>
                      {signal.priceChange >= 0 ? '+' : ''}{signal.priceChange?.toFixed(2) || '0.00'}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">{signal.strength}%</div>
                    <div className="text-xs text-white/60">Strength</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold text-secondary">{signal.confidence}%</div>
                    <div className="text-xs text-white/60">Confidence</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-sm font-medium ${
                      signal.riskLevel === 'LOW' ? 'text-support' :
                      signal.riskLevel === 'MEDIUM' ? 'text-warning-500' : 'text-danger-400'
                    }`}>
                      {signal.riskLevel}
                    </div>
                    <div className="text-xs text-white/60">Risk</div>
                  </div>
                  
                  {signal.stopLoss && signal.takeProfit && (
                    <div className="text-center">
                      <div className="text-sm text-white">SL: ${signal.stopLoss.toFixed(2)}</div>
                      <div className="text-sm text-white">TP: ${signal.takeProfit.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Reasoning */}
              {signal.reasoning && signal.reasoning.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h5 className="text-sm font-medium text-white mb-2">Analysis:</h5>
                  <div className="flex flex-wrap gap-2">
                    {signal.reasoning.map((reason: string, index: number) => (
                      <span key={index} className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {filteredSignals.length === 0 && (
          <div className="p-8 text-center text-white/60">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No signals found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
