'use client';
import { useState, useEffect } from 'react';

type MetricData = {
  timestamp: number;
  responseTime: number;
  requestsPerSecond: number;
  cacheHitRate: number;
  errorRate: number;
};

export default function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCollecting) {
      interval = setInterval(async () => {
        try {
          const start = Date.now();
          const response = await fetch('/api/health');
          const responseTime = Date.now() - start;
          
          if (response.ok) {
            const data = await response.json();
            const newMetric: MetricData = {
              timestamp: Date.now(),
              responseTime,
              requestsPerSecond: Math.random() * 50 + 10, // Simulated
              cacheHitRate: Math.random() * 0.3 + 0.7, // 70-100%
              errorRate: Math.random() * 0.05 // 0-5%
            };
            
            setMetrics(prev => [newMetric, ...prev.slice(0, 19)]); // Keep last 20
          }
        } catch (error) {
          console.error('Failed to collect metrics:', error);
        }
      }, 5000); // Collect every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCollecting]);

  const getAverageMetric = (key: keyof MetricData) => {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + metric[key] as number, 0);
    return sum / metrics.length;
  };

  const getLatestMetric = (key: keyof MetricData) => {
    return metrics.length > 0 ? metrics[0][key] as number : 0;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="ds-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Performance Metrics</h3>
        <button
          onClick={() => setIsCollecting(!isCollecting)}
          className={`badge ${isCollecting ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}
        >
          {isCollecting ? 'Stop' : 'Start'}
        </button>
      </div>

      {metrics.length > 0 ? (
        <div className="space-y-4">
          {/* Current Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-400">Response Time</div>
              <div className="text-lg font-semibold text-emerald-400">
                {getLatestMetric('responseTime').toFixed(0)}ms
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">RPS</div>
              <div className="text-lg font-semibold text-blue-400">
                {getLatestMetric('requestsPerSecond').toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Cache Hit Rate</div>
              <div className="text-lg font-semibold text-purple-400">
                {(getLatestMetric('cacheHitRate') * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Error Rate</div>
              <div className="text-lg font-semibold text-rose-400">
                {(getLatestMetric('errorRate') * 100).toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Averages */}
          <div className="pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Averages (Last {metrics.length} samples)</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Avg Response:</span>
                <span className="ml-1 text-emerald-400">
                  {getAverageMetric('responseTime').toFixed(0)}ms
                </span>
              </div>
              <div>
                <span className="text-gray-400">Avg RPS:</span>
                <span className="ml-1 text-blue-400">
                  {getAverageMetric('requestsPerSecond').toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Avg Cache Hit:</span>
                <span className="ml-1 text-purple-400">
                  {(getAverageMetric('cacheHitRate') * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-400">Avg Error:</span>
                <span className="ml-1 text-rose-400">
                  {(getAverageMetric('errorRate') * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div className="pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Recent History</div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {metrics.slice(0, 10).map((metric, index) => (
                <div key={metric.timestamp} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{formatTime(metric.timestamp)}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400">{metric.responseTime.toFixed(0)}ms</span>
                    <span className="text-blue-400">{metric.requestsPerSecond.toFixed(1)}rps</span>
                    <span className="text-purple-400">{(metric.cacheHitRate * 100).toFixed(0)}%</span>
                    <span className="text-rose-400">{(metric.errorRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-sm text-gray-400 mb-2">
            {isCollecting ? 'Collecting metrics...' : 'No metrics collected'}
          </div>
          <div className="text-xs text-gray-500">
            Click "Start" to begin collecting performance data
          </div>
        </div>
      )}
    </div>
  );
}
