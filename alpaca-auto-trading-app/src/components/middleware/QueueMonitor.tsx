'use client';
import { useState, useEffect } from 'react';

type QueueJob = {
  id: string;
  name: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  createdAt: number;
  processedAt?: number;
  error?: string;
};

type QueueStats = {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
};

export default function QueueMonitor() {
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    total: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isMonitoring) {
      // Simulate queue monitoring
      interval = setInterval(() => {
        const newJobs: QueueJob[] = [];
        
        // Generate some sample jobs
        const jobTypes = ['ai.advisor.generate', 'bt.backtest.run', 'ai.sentiment.analyze'];
        const statuses: QueueJob['status'][] = ['waiting', 'active', 'completed', 'failed'];
        
        for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
          const job: QueueJob = {
            id: `job_${Date.now()}_${i}`,
            name: jobTypes[Math.floor(Math.random() * jobTypes.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            progress: Math.floor(Math.random() * 100),
            createdAt: Date.now() - Math.random() * 300000, // Last 5 minutes
            processedAt: Math.random() > 0.5 ? Date.now() - Math.random() * 60000 : undefined,
            error: Math.random() > 0.8 ? 'Connection timeout' : undefined
          };
          newJobs.push(job);
        }
        
        setJobs(prev => [...newJobs, ...prev.slice(0, 19)]); // Keep last 20
        
        // Update stats
        const newStats = newJobs.reduce((acc, job) => {
          acc[job.status]++;
          acc.total++;
          return acc;
        }, { waiting: 0, active: 0, completed: 0, failed: 0, total: 0 });
        
        setStats(prev => ({
          waiting: prev.waiting + newStats.waiting,
          active: prev.active + newStats.active,
          completed: prev.completed + newStats.completed,
          failed: prev.failed + newStats.failed,
          total: prev.total + newStats.total
        }));
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  const getStatusColor = (status: QueueJob['status']) => {
    switch (status) {
      case 'waiting': return 'text-yellow-400';
      case 'active': return 'text-blue-400';
      case 'completed': return 'text-emerald-400';
      case 'failed': return 'text-rose-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: QueueJob['status']) => {
    switch (status) {
      case 'waiting': return '⏳';
      case 'active': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) return `${minutes}m ${seconds}s ago`;
    return `${seconds}s ago`;
  };

  const clearCompleted = () => {
    setJobs(prev => prev.filter(job => job.status !== 'completed'));
    setStats(prev => ({ ...prev, completed: 0, total: prev.total - prev.completed }));
  };

  return (
    <div className="ds-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Queue Monitor</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={clearCompleted}
            className="text-xs text-gray-400 hover:text-gray-300"
            disabled={stats.completed === 0}
          >
            Clear Completed
          </button>
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`badge ${isMonitoring ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}
          >
            {isMonitoring ? 'Stop' : 'Monitor'}
          </button>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-400">{stats.waiting}</div>
          <div className="text-xs text-gray-400">Waiting</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-400">{stats.active}</div>
          <div className="text-xs text-gray-400">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-emerald-400">{stats.completed}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-rose-400">{stats.failed}</div>
          <div className="text-xs text-gray-400">Failed</div>
        </div>
      </div>

      {/* Job List */}
      {jobs.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-2 bg-gray-800 rounded text-xs">
              <div className="flex items-center gap-2">
                <span>{getStatusIcon(job.status)}</span>
                <div>
                  <div className="font-mono">{job.name}</div>
                  <div className="text-gray-400">{formatTime(job.createdAt)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {job.status === 'active' && (
                  <div className="w-16 bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-blue-400 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                )}
                <span className={`font-semibold ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-sm text-gray-400 mb-2">
            {isMonitoring ? 'Monitoring queue...' : 'No jobs in queue'}
          </div>
          <div className="text-xs text-gray-500">
            {isMonitoring ? 'Jobs will appear here as they are processed' : 'Click "Monitor" to start watching the queue'}
          </div>
        </div>
      )}

      {/* Queue Health */}
      {stats.total > 0 && (
        <div className="pt-4 border-t border-gray-700 mt-4">
          <div className="text-xs text-gray-400 mb-2">Queue Health</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-400">
              {((stats.completed / stats.total) * 100).toFixed(1)}% success rate
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
