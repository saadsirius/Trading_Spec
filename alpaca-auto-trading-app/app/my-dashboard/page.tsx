"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, TrendingUp, TrendingDown, Target, 
  Calendar, DollarSign, PieChart, Activity,
  Settings, Bell, Star, Eye, Filter, CheckCircle
} from "lucide-react";
import GlassButton from "../components/GlassButton";

interface UserMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  winRate: number;
  totalTrades: number;
  avgWin: number;
  avgLoss: number;
  sharpeRatio: number;
  maxDrawdown: number;
  bestPerformer: {
    symbol: string;
    return: number;
  };
  worstPerformer: {
    symbol: string;
    return: number;
  };
}

interface CustomGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  type: 'return' | 'trades' | 'winrate' | 'drawdown';
}

export default function UserDashboard() {
  const userId = 'demo';
  const [activeView, setActiveView] = useState<'overview' | 'performance' | 'goals' | 'customize'>('overview');
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [customGoals, setCustomGoals] = useState<CustomGoal[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls - in real app these would be actual API endpoints
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      setUserMetrics({
        totalReturn: 15420.50,
        totalReturnPercent: 23.4,
        winRate: 68.5,
        totalTrades: 127,
        avgWin: 245.30,
        avgLoss: -156.80,
        sharpeRatio: 1.85,
        maxDrawdown: -8.2,
        bestPerformer: { symbol: 'NVDA', return: 45.6 },
        worstPerformer: { symbol: 'TSLA', return: -12.3 }
      });

      setCustomGoals([
        {
          id: '1',
          title: 'Monthly Return Target',
          target: 15,
          current: 23.4,
          deadline: '2024-01-31',
          type: 'return'
        },
        {
          id: '2',
          title: 'Win Rate Improvement',
          target: 75,
          current: 68.5,
          deadline: '2024-02-15',
          type: 'winrate'
        },
        {
          id: '3',
          title: 'Trade Volume Goal',
          target: 150,
          current: 127,
          deadline: '2024-01-31',
          type: 'trades'
        }
      ]);

      setWatchlist([
        { symbol: 'AAPL', name: 'Apple Inc.', price: 195.89, change: 2.34, alerts: 3 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.56, change: -1.23, alerts: 1 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 0.87, alerts: 2 },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 156.78, change: 1.45, alerts: 0 }
      ]);

      setRecentActivity([
        { type: 'trade', symbol: 'AAPL', action: 'BUY', quantity: 10, price: 195.50, time: '2 hours ago' },
        { type: 'signal', symbol: 'NVDA', signal: 'BUY', confidence: 87, time: '4 hours ago' },
        { type: 'alert', symbol: 'GOOGL', message: 'Price target reached', time: '6 hours ago' },
        { type: 'goal', message: 'Monthly return target achieved!', time: '1 day ago' }
      ]);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-white/80">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* Personal Header */}
      <header className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Trading Journey</h1>
              <p className="text-white/80">Track your progress, set goals, and optimize your strategy</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <GlassButton variant="secondary" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </GlassButton>
              <GlassButton size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </GlassButton>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-1 bg-white/5 rounded-xl p-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'customize', label: 'Customize', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === id
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
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'overview' && <OverviewView metrics={userMetrics} watchlist={watchlist} recentActivity={recentActivity} />}
          {activeView === 'performance' && <PerformanceView metrics={userMetrics} />}
          {activeView === 'goals' && <GoalsView goals={customGoals} onUpdateGoals={setCustomGoals} />}
          {activeView === 'customize' && <CustomizeView />}
        </motion.div>
      </main>
    </div>
  );
}

// Overview View Component
function OverviewView({ metrics, watchlist, recentActivity }: { 
  metrics: UserMetrics | null; 
  watchlist: any[]; 
  recentActivity: any[]; 
}) {
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Total Return</h3>
            <DollarSign className="w-5 h-5 text-support" />
          </div>
          <div className={`text-3xl font-bold ${metrics.totalReturn >= 0 ? 'text-support' : 'text-danger-400'}`}>
            ${metrics.totalReturn.toLocaleString()}
          </div>
          <div className={`text-sm ${metrics.totalReturnPercent >= 0 ? 'text-support' : 'text-danger-400'}`}>
            {metrics.totalReturnPercent >= 0 ? '+' : ''}{metrics.totalReturnPercent.toFixed(1)}%
          </div>
        </div>

        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Win Rate</h3>
            <Target className="w-5 h-5 text-secondary" />
          </div>
          <div className="text-3xl font-bold text-white">{metrics.winRate.toFixed(1)}%</div>
          <div className="text-sm text-white/60">{metrics.totalTrades} total trades</div>
        </div>

        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Sharpe Ratio</h3>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold text-white">{metrics.sharpeRatio.toFixed(2)}</div>
          <div className="text-sm text-white/60">Risk-adjusted returns</div>
        </div>

        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Max Drawdown</h3>
            <TrendingDown className="w-5 h-5 text-accent" />
          </div>
          <div className="text-3xl font-bold text-danger-400">{metrics.maxDrawdown.toFixed(1)}%</div>
          <div className="text-sm text-white/60">Peak to trough</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Watchlist */}
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Your Watchlist</h3>
            <Star className="w-5 h-5 text-accent" />
          </div>
          <div className="space-y-3">
            {watchlist.map((item) => (
              <div key={item.symbol} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="font-medium text-white">{item.symbol}</div>
                  <div className="text-sm text-white/60">{item.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">${item.price}</div>
                  <div className={`text-sm ${item.change >= 0 ? 'text-support' : 'text-danger-400'}`}>
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                  </div>
                </div>
                {item.alerts > 0 && (
                  <div className="ml-2">
                    <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                      {item.alerts}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <Activity className="w-5 h-5 text-secondary" />
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'trade' ? 'bg-support' :
                  activity.type === 'signal' ? 'bg-secondary' :
                  activity.type === 'alert' ? 'bg-accent' : 'bg-primary'
                }`}></div>
                <div className="flex-1">
                  <div className="text-white text-sm">
                    {activity.type === 'trade' && `${activity.action} ${activity.quantity} ${activity.symbol} @ $${activity.price}`}
                    {activity.type === 'signal' && `${activity.symbol} ${activity.signal} signal (${activity.confidence}% confidence)`}
                    {activity.type === 'alert' && `${activity.symbol}: ${activity.message}`}
                    {activity.type === 'goal' && activity.message}
                  </div>
                  <div className="text-xs text-white/60">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Performance View Component
function PerformanceView({ metrics }: { metrics: UserMetrics | null }) {
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="glass p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Performance Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trade Statistics */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Trade Statistics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Total Trades</span>
                <span className="text-white font-medium">{metrics.totalTrades}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Win Rate</span>
                <span className="text-support font-medium">{metrics.winRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Average Win</span>
                <span className="text-support font-medium">${metrics.avgWin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Average Loss</span>
                <span className="text-danger-400 font-medium">${metrics.avgLoss.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Profit Factor</span>
                <span className="text-white font-medium">
                  {(Math.abs(metrics.avgWin * metrics.winRate / 100) / Math.abs(metrics.avgLoss * (100 - metrics.winRate) / 100)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Risk Metrics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Sharpe Ratio</span>
                <span className="text-primary font-medium">{metrics.sharpeRatio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Max Drawdown</span>
                <span className="text-danger-400 font-medium">{metrics.maxDrawdown.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Best Performer</span>
                <span className="text-support font-medium">{metrics.bestPerformer.symbol} (+{metrics.bestPerformer.return.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Worst Performer</span>
                <span className="text-danger-400 font-medium">{metrics.worstPerformer.symbol} ({metrics.worstPerformer.return.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Goals View Component
function GoalsView({ goals, onUpdateGoals }: { 
  goals: CustomGoal[]; 
  onUpdateGoals: (goals: CustomGoal[]) => void; 
}) {
  const [newGoal, setNewGoal] = useState({
    title: '',
    target: 0,
    deadline: '',
    type: 'return' as const
  });

  const addGoal = () => {
    if (newGoal.title && newGoal.target > 0 && newGoal.deadline) {
      const goal: CustomGoal = {
        id: Date.now().toString(),
        ...newGoal,
        current: 0
      };
      onUpdateGoals([...goals, goal]);
      setNewGoal({ title: '', target: 0, deadline: '', type: 'return' });
    }
  };

  const getProgressPercentage = (goal: CustomGoal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Add New Goal */}
      <div className="glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Add New Goal</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Goal title"
            value={newGoal.title}
            onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40"
          />
          <input
            type="number"
            placeholder="Target value"
            value={newGoal.target || ''}
            onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseFloat(e.target.value) || 0 }))}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40"
          />
          <input
            type="date"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          />
          <GlassButton onClick={addGoal}>
            Add Goal
          </GlassButton>
        </div>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = getProgressPercentage(goal);
          const isCompleted = progress >= 100;
          
          return (
            <div key={goal.id} className="glass p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-white">{goal.title}</h4>
                {isCompleted && <CheckCircle className="w-5 h-5 text-support" />}
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-white/80 mb-2">
                  <span>{goal.current.toFixed(1)} / {goal.target.toFixed(1)}</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-support' : 'bg-secondary'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-white/60">
                <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                <span className="capitalize">{goal.type}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Customize View Component
function CustomizeView() {
  return (
    <div className="space-y-6">
      <div className="glass p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Customize Your Dashboard</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Display Preferences */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Display Preferences</h4>
            <div className="space-y-4">
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-white/80">Show sparklines</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-white/80">Show AI confidence scores</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-white/80">Enable sound notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-white/80">Show risk levels</span>
              </label>
            </div>
          </div>

          {/* Trading Preferences */}
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Trading Preferences</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Default Position Size (%)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  defaultValue="5" 
                  className="w-full"
                />
                <div className="text-sm text-white/60 mt-1">5% of portfolio</div>
              </div>
              <div>
                <label className="block text-white/80 mb-2">Risk Tolerance</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white">
                  <option>Conservative</option>
                  <option selected>Moderate</option>
                  <option>Aggressive</option>
                </select>
              </div>
              <div>
                <label className="block text-white/80 mb-2">Auto-trade Confidence Threshold</label>
                <input 
                  type="range" 
                  min="50" 
                  max="95" 
                  defaultValue="80" 
                  className="w-full"
                />
                <div className="text-sm text-white/60 mt-1">80% confidence</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/10">
          <GlassButton>
            Save Preferences
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
