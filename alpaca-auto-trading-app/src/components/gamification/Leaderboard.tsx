'use client';
import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar?: string;
  score: number;
  level: number;
  achievements: number;
  streak: number;
  rank: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  type: 'points' | 'streak' | 'achievements' | 'performance';
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time';
}

export default function Leaderboard({ type, timeframe }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    // Simulate loading leaderboard data
    const loadLeaderboard = async () => {
      setLoading(true);
      
      // Mock data - in real app, fetch from API
      const mockData: LeaderboardEntry[] = [
        {
          id: '1',
          username: 'TradingMaster',
          avatar: '👑',
          score: 2450,
          level: 25,
          achievements: 18,
          streak: 15,
          rank: 1,
          isCurrentUser: false
        },
        {
          id: '2',
          username: 'PortfolioPro',
          avatar: '💼',
          score: 2200,
          level: 22,
          achievements: 16,
          streak: 12,
          rank: 2,
          isCurrentUser: false
        },
        {
          id: '3',
          username: 'RiskRuler',
          avatar: '🛡️',
          score: 1950,
          level: 20,
          achievements: 14,
          streak: 8,
          rank: 3,
          isCurrentUser: false
        },
        {
          id: '4',
          username: 'You',
          avatar: '🎯',
          score: 1200,
          level: 12,
          achievements: 8,
          streak: 5,
          rank: 4,
          isCurrentUser: true
        },
        {
          id: '5',
          username: 'ChartChampion',
          avatar: '📈',
          score: 1100,
          level: 11,
          achievements: 7,
          streak: 3,
          rank: 5,
          isCurrentUser: false
        }
      ];

      // Sort by the selected type
      const sortedData = mockData.sort((a, b) => {
        switch (type) {
          case 'points':
            return b.score - a.score;
          case 'streak':
            return b.streak - a.streak;
          case 'achievements':
            return b.achievements - a.achievements;
          case 'performance':
            return b.score - a.score; // Simplified for demo
          default:
            return b.score - a.score;
        }
      });

      // Update ranks
      const rankedData = sortedData.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

      setEntries(rankedData);
      setCurrentUserRank(rankedData.find(entry => entry.isCurrentUser)?.rank || null);
      setLoading(false);
    };

    loadLeaderboard();
  }, [type, timeframe]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getScoreValue = (entry: LeaderboardEntry) => {
    switch (type) {
      case 'points':
        return entry.score.toLocaleString();
      case 'streak':
        return `${entry.streak} days`;
      case 'achievements':
        return `${entry.achievements} unlocked`;
      case 'performance':
        return `${((entry.score / 2500) * 100).toFixed(1)}%`;
      default:
        return entry.score.toLocaleString();
    }
  };

  const getScoreLabel = () => {
    switch (type) {
      case 'points':
        return 'Points';
      case 'streak':
        return 'Streak';
      case 'achievements':
        return 'Achievements';
      case 'performance':
        return 'Performance';
      default:
        return 'Score';
    }
  };

  if (loading) {
    return (
      <div className="ds-card p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Leaderboard</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 capitalize">{type}</span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-400 capitalize">{timeframe}</span>
        </div>
      </div>

      {/* Current User Rank */}
      {currentUserRank && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-400">Your Rank</span>
            <span className="text-lg font-bold text-blue-400">
              {getRankIcon(currentUserRank)}
            </span>
          </div>
        </div>
      )}

      {/* Leaderboard Entries */}
      <div className="space-y-2">
        {entries.slice(0, 10).map((entry) => (
          <div
            key={entry.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              entry.isCurrentUser 
                ? 'bg-blue-900/20 border border-blue-500/30' 
                : 'bg-gray-800/50 hover:bg-gray-800/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`text-lg font-bold ${getRankColor(entry.rank)}`}>
                {getRankIcon(entry.rank)}
              </div>
              <div className="text-2xl">{entry.avatar}</div>
              <div>
                <div className="text-sm font-semibold">
                  {entry.username}
                  {entry.isCurrentUser && (
                    <span className="ml-2 text-xs text-blue-400">(You)</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  Level {entry.level} • {entry.achievements} achievements
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">
                {getScoreValue(entry)}
              </div>
              <div className="text-xs text-gray-400">
                {getScoreLabel()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeframe Selector */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Timeframe</div>
        <div className="flex gap-1">
          {['daily', 'weekly', 'monthly', 'all-time'].map((tf) => (
            <button
              key={tf}
              className={`px-2 py-1 text-xs rounded ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Type Selector */}
      <div className="mt-3">
        <div className="text-xs text-gray-400 mb-2">Ranking Type</div>
        <div className="flex gap-1">
          {['points', 'streak', 'achievements', 'performance'].map((t) => (
            <button
              key={t}
              className={`px-2 py-1 text-xs rounded ${
                type === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
