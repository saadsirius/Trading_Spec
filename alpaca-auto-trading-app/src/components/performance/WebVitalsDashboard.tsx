'use client';
import { useState, useEffect } from 'react';
import { webVitals, WebVitalsMetric } from '@/lib/performance/web-vitals';

export default function WebVitalsDashboard() {
  const [metrics, setMetrics] = useState<WebVitalsMetric[]>([]);
  const [score, setScore] = useState({ overall: 0, breakdown: {} as Record<string, number> });
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(webVitals.getMetrics());
      setScore(webVitals.getScore());
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-rose-500';
  };

  const formatValue = (name: string, value: number) => {
    switch (name) {
      case 'CLS':
        return value.toFixed(3);
      case 'INP':
      case 'FCP':
      case 'LCP':
      case 'TTFB':
        return `${Math.round(value)}ms`;
      default:
        return value.toString();
    }
  };

  const getMetricDescription = (name: string) => {
    const descriptions: Record<string, string> = {
      CLS: 'Cumulative Layout Shift - Visual stability',
      INP: 'Interaction to Next Paint - Interactivity',
      FCP: 'First Contentful Paint - Loading performance',
      LCP: 'Largest Contentful Paint - Loading performance',
      TTFB: 'Time to First Byte - Server response time'
    };
    return descriptions[name] || '';
  };

  return (
    <div className="ds-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Web Vitals Performance</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
          <span className="text-xs text-gray-400">
            {isMonitoring ? 'Monitoring' : 'Stopped'}
          </span>
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Overall Score</span>
          <span className={`text-lg font-bold ${getScoreColor(score.overall)}`}>
            {Math.round(score.overall)}/100
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getScoreBg(score.overall)}`}
            style={{ width: `${score.overall}%` }}
          ></div>
        </div>
      </div>

      {/* Individual Metrics */}
      <div className="space-y-3">
        {['CLS', 'INP', 'FCP', 'LCP', 'TTFB'].map(name => {
          const latest = metrics.find(m => m.name === name);
          const avgScore = score.breakdown[name] || 0;
          
          return (
            <div key={name} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{name}</span>
                  <span className="text-xs text-gray-400">
                    {getMetricDescription(name)}
                  </span>
                </div>
                {latest && (
                  <div className="text-xs text-gray-500 mt-1">
                    Latest: {formatValue(name, latest.value)} 
                    <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                      latest.rating === 'good' ? 'bg-emerald-900 text-emerald-300' :
                      latest.rating === 'needs-improvement' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-rose-900 text-rose-300'
                    }`}>
                      {latest.rating}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${getScoreColor(avgScore)}`}>
                  {Math.round(avgScore)}
                </div>
                <div className="w-16 bg-gray-700 rounded-full h-1 mt-1">
                  <div 
                    className={`h-1 rounded-full ${getScoreBg(avgScore)}`}
                    style={{ width: `${avgScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Metrics */}
      {metrics.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Recent Metrics</div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {metrics.slice(-5).reverse().map((metric, index) => (
              <div key={`${metric.name}-${metric.timestamp}`} className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  {new Date(metric.timestamp).toLocaleTimeString()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{metric.name}</span>
                  <span className="text-gray-300">{formatValue(metric.name, metric.value)}</span>
                  <span className={`px-1 py-0.5 rounded text-xs ${
                    metric.rating === 'good' ? 'bg-emerald-900 text-emerald-300' :
                    metric.rating === 'needs-improvement' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-rose-900 text-rose-300'
                  }`}>
                    {metric.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (isMonitoring) {
                webVitals.stop();
                setIsMonitoring(false);
              } else {
                webVitals.start();
                setIsMonitoring(true);
              }
            }}
            className="flex-1 bg-blue-600 text-white px-3 py-2 text-sm rounded hover:bg-blue-700"
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
          <button
            onClick={() => {
              setMetrics([]);
              setScore({ overall: 0, breakdown: {} });
            }}
            className="flex-1 bg-gray-600 text-white px-3 py-2 text-sm rounded hover:bg-gray-700"
          >
            Clear Data
          </button>
        </div>
      </div>
    </div>
  );
}
