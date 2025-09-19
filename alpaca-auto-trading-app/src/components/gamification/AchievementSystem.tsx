'use client';
import { useState, useEffect } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'trading' | 'portfolio' | 'learning' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

interface UserStats {
  level: number;
  experience: number;
  totalPoints: number;
  achievementsUnlocked: number;
  streak: number;
  lastActive: number;
}

export default function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-trade',
      title: 'First Trade',
      description: 'Execute your first trade',
      icon: '🎯',
      category: 'trading',
      rarity: 'common',
      points: 10,
      unlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'profit-master',
      title: 'Profit Master',
      description: 'Achieve 10% portfolio growth',
      icon: '💰',
      category: 'portfolio',
      rarity: 'rare',
      points: 50,
      unlocked: false,
      progress: 0,
      maxProgress: 10
    },
    {
      id: 'streak-keeper',
      title: 'Streak Keeper',
      description: 'Trade for 7 consecutive days',
      icon: '🔥',
      category: 'trading',
      rarity: 'epic',
      points: 100,
      unlocked: false,
      progress: 0,
      maxProgress: 7
    },
    {
      id: 'risk-manager',
      title: 'Risk Manager',
      description: 'Never exceed 2% risk per trade',
      icon: '🛡️',
      category: 'trading',
      rarity: 'legendary',
      points: 200,
      unlocked: false,
      progress: 0,
      maxProgress: 50
    },
    {
      id: 'diversification-expert',
      title: 'Diversification Expert',
      description: 'Hold positions in 5 different sectors',
      icon: '🌐',
      category: 'portfolio',
      rarity: 'rare',
      points: 75,
      unlocked: false,
      progress: 0,
      maxProgress: 5
    }
  ]);

  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    experience: 0,
    totalPoints: 0,
    achievementsUnlocked: 0,
    streak: 0,
    lastActive: Date.now()
  });

  const [showNotification, setShowNotification] = useState<Achievement | null>(null);

  useEffect(() => {
    // Load user stats from localStorage
    const savedStats = localStorage.getItem('user-stats');
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }

    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
  }, []);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-500';
      case 'rare': return 'text-blue-400 border-blue-500';
      case 'epic': return 'text-purple-400 border-purple-500';
      case 'legendary': return 'text-yellow-400 border-yellow-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const getRarityBg = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-900/50';
      case 'rare': return 'bg-blue-900/50';
      case 'epic': return 'bg-purple-900/50';
      case 'legendary': return 'bg-yellow-900/50';
      default: return 'bg-gray-900/50';
    }
  };

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'trading': return '📈';
      case 'portfolio': return '💼';
      case 'learning': return '📚';
      case 'social': return '👥';
      default: return '🏆';
    }
  };

  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === achievementId && !achievement.unlocked) {
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: Date.now()
        };
        
        setShowNotification(unlockedAchievement);
        
        // Update user stats
        setUserStats(prevStats => {
          const newStats = {
            ...prevStats,
            totalPoints: prevStats.totalPoints + achievement.points,
            achievementsUnlocked: prevStats.achievementsUnlocked + 1,
            experience: prevStats.experience + achievement.points
          };
          
          // Check for level up
          const newLevel = Math.floor(newStats.experience / 100) + 1;
          if (newLevel > prevStats.level) {
            newStats.level = newLevel;
          }
          
          localStorage.setItem('user-stats', JSON.stringify(newStats));
          return newStats;
        });
        
        return unlockedAchievement;
      }
      return achievement;
    }));
    
    // Save to localStorage
    const updatedAchievements = achievements.map(achievement => 
      achievement.id === achievementId 
        ? { ...achievement, unlocked: true, unlockedAt: Date.now() }
        : achievement
    );
    localStorage.setItem('achievements', JSON.stringify(updatedAchievements));
  };

  const getProgressPercentage = (achievement: Achievement) => {
    if (!achievement.maxProgress) return 0;
    return Math.min((achievement.progress || 0) / achievement.maxProgress * 100, 100);
  };

  return (
    <div className="ds-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Achievements</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Level {userStats.level}</span>
          <div className="w-16 bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${(userStats.experience % 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{userStats.totalPoints}</div>
          <div className="text-xs text-gray-400">Points</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-400">{userStats.achievementsUnlocked}</div>
          <div className="text-xs text-gray-400">Unlocked</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-400">{userStats.streak}</div>
          <div className="text-xs text-gray-400">Day Streak</div>
        </div>
      </div>

      {/* Achievements List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-3 rounded-lg border ${getRarityColor(achievement.rarity)} ${
              achievement.unlocked ? getRarityBg(achievement.rarity) : 'bg-gray-900/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{achievement.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {getCategoryIcon(achievement.category)}
                    </span>
                    <span className="text-xs font-bold">+{achievement.points}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-300 mt-1">{achievement.description}</p>
                
                {achievement.maxProgress && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress || 0}/{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(achievement)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="text-xs text-emerald-400 mt-1">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Test Button (for demo) */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <button
          onClick={() => unlockAchievement('first-trade')}
          className="w-full bg-blue-600 text-white px-3 py-2 text-sm rounded hover:bg-blue-700"
        >
          Test Unlock Achievement
        </button>
      </div>

      {/* Achievement Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl max-w-sm">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{showNotification.icon}</div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-400">Achievement Unlocked!</h4>
              <p className="text-xs text-gray-300">{showNotification.title}</p>
              <p className="text-xs text-gray-400">+{showNotification.points} points</p>
            </div>
            <button
              onClick={() => setShowNotification(null)}
              className="text-gray-400 hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
