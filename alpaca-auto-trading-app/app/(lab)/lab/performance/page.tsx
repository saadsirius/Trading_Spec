'use client';
import WebVitalsDashboard from '@/components/performance/WebVitalsDashboard';
import AchievementSystem from '@/components/gamification/AchievementSystem';
import Leaderboard from '@/components/gamification/Leaderboard';
import AssistantCoach from '@/components/ai/AssistantCoach';

export default function PerformanceLab() {
  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Performance & Gamification Lab</h1>
        <div className="text-sm text-gray-400">
          Real-time performance monitoring and user engagement
        </div>
      </div>

      {/* Performance Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WebVitalsDashboard />
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold mb-4">Prefetch Statistics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total Prefetched</span>
              <span className="text-sm font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Success Rate</span>
              <span className="text-sm font-semibold text-emerald-400">100%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">High Priority</span>
              <span className="text-sm font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Load Rate</span>
              <span className="text-sm font-semibold text-blue-400">0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gamification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AchievementSystem />
        <Leaderboard type="points" timeframe="all-time" />
      </div>

      {/* AI Assistant Coach */}
      <div className="ds-card p-4">
        <h3 className="text-sm font-semibold mb-4">AI Assistant Coach</h3>
        <div className="text-sm text-gray-400 mb-4">
          The AI coach provides contextual tips and insights based on your trading activity and market conditions.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-lg mb-2">🎯</div>
            <div className="text-sm font-semibold">Trading Tips</div>
            <div className="text-xs text-gray-400">Risk management and strategy advice</div>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-lg mb-2">📊</div>
            <div className="text-sm font-semibold">Market Analysis</div>
            <div className="text-xs text-gray-400">Real-time market insights</div>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-lg mb-2">💼</div>
            <div className="text-sm font-semibold">Portfolio Guidance</div>
            <div className="text-xs text-gray-400">Diversification and optimization</div>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <div className="text-lg mb-2">🎓</div>
            <div className="text-sm font-semibold">Learning</div>
            <div className="text-xs text-gray-400">Educational content and tutorials</div>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="ds-card p-4">
        <h3 className="text-sm font-semibold mb-4">Performance Optimization Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-emerald-400">✅ Best Practices</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Use prefetching for critical navigation paths</li>
              <li>• Monitor Core Web Vitals regularly</li>
              <li>• Implement lazy loading for images and components</li>
              <li>• Use service workers for offline functionality</li>
              <li>• Optimize bundle size with code splitting</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-yellow-400">⚠️ Common Issues</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Large JavaScript bundles causing slow FCP</li>
              <li>• Unoptimized images affecting LCP</li>
              <li>• Layout shifts from dynamic content</li>
              <li>• Blocking resources preventing fast TTFB</li>
              <li>• Poor caching strategies</li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Assistant Coach Component */}
      <AssistantCoach context="general" enabled={true} />
    </div>
  );
}
