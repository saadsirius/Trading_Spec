'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR, { mutate } from 'swr';

// ──────────────────────────────────────────────────────────────────────────────
// Types (adjust to your API shape if needed)
// ──────────────────────────────────────────────────────────────────────────────

type AgentPerf = { accuracy: number; profit: number; trades: number };
type Agent = { id: string; name: string; type: string; status: 'active' | 'stopped'; performance: AgentPerf };

type AgentsResp = { agents: Agent[] };

type MetaPerf = {
  baseAccuracy: number;
  adaptedAccuracy: number;
  adaptationTime: number;
  memoryUsage: number;
};
type MetaModel = {
  id: string;
  name: string;
  status: 'active' | 'training' | 'idle';
  performance: MetaPerf;
  tasks?: { symbol?: string; regime?: string; adaptationScore: number }[];
};
type MetaResp = { models: MetaModel[] };

type GAStats = { totalGenerations: number; convergenceRate: number; diversity: number; stagnationCount: number };
type Genome = { id: string; fitness: number };
type GAResults = {
  currentGeneration: number;
  bestFitness: number;
  averageFitness: number;
  population?: Genome[];
  statistics: GAStats;
};
type GAResp = { results: GAResults };

type HybridPerf = {
  overallAccuracy: number;
  profit: number;
  sharpe: number;
  winRate: number;
};
type HybridComponents = {
  neural: { type: string; accuracy: number };
  rules: { type: string; accuracy: number };
  ensemble: { method: string; accuracy: number };
};
type HybridModel = {
  id: string;
  name: string;
  status: 'active' | 'training' | 'idle';
  performance: HybridPerf;
  components: HybridComponents;
};
type HybridResp = { models: HybridModel[] };

type MonitoringResp = {
  data: {
    system: { status: 'healthy' | 'degraded' | 'down'; uptime: string; responseTime: number; errorRate: number };
    models: { total: number; active: number; training: number; accuracy: { average: number } };
    agents: Record<string, { active: number; accuracy: number }>;
    alerts: { id: string; severity: 'info' | 'warning' | 'error'; timestamp: string | number; message: string }[];
  };
};

// ──────────────────────────────────────────────────────────────────────────────
/** Resilient fetcher: timeout + JSON guard + HTTP error surfacing */
const fetcher: <T>(url: string) => Promise<T> = async (url) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    const txt = await r.text();
    try {
      return JSON.parse(txt) as any;
    } catch {
      throw new Error(`Invalid JSON from ${url}`);
    }
  } finally {
    clearTimeout(t);
  }
};

// Small UI helpers
function StatusPill({ value }: { value: string }) {
  const cls =
    value === 'active'
      ? 'bg-emerald-900 text-emerald-300'
      : value === 'training'
      ? 'bg-yellow-900 text-yellow-300'
      : value === 'healthy'
      ? 'bg-emerald-900 text-emerald-300'
      : value === 'error'
      ? 'bg-red-900 text-red-300'
      : 'bg-gray-900 text-gray-300';
  return <span className={`px-2 py-1 rounded text-xs capitalize ${cls}`}>{value}</span>;
}

function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="ds-card p-4 animate-pulse">
          <div className="h-4 w-1/2 bg-gray-700 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-700 rounded" />
            <div className="h-3 w-2/3 bg-gray-700 rounded" />
            <div className="h-3 w-1/3 bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

type TabId = 'agents' | 'meta' | 'genetic' | 'hybrid' | 'monitoring';
type TabDef = { id: TabId; label: string; count: number };

function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[];
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <div role="tablist" aria-label="AI sections" className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
      {tabs.map((tab, i) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title={`⌨︎ ${i + 1}`}
          >
            {tab.label}
            {tab.count > 0 && <span className="ml-2 px-2 py-0.5 bg-gray-600 text-xs rounded-full">{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

export default function AISystemsLab() {
  // ---------------- URL + storage sync ----------------
  const router = useRouter();
  const sp = useSearchParams();

  // lecture initiale: ?tab=…, sinon localStorage, sinon 'agents'
  const initialTab = (() => {
    const q = (sp.get('tab') as TabId | null) ?? null;
    if (q && ['agents', 'meta', 'genetic', 'hybrid', 'monitoring'].includes(q)) return q as TabId;
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('aisys:lastTab') as TabId | null;
      if (saved) return saved;
    }
    return 'agents' as TabId;
  })();

  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // push URL quand l'onglet change + persistance
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', activeTab);
    router.replace(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
    window.localStorage.setItem('aisys:lastTab', activeTab);
  }, [activeTab, router]);

  // raccourcis clavier 1..5
  useEffect(() => {
    const ids: TabId[] = ['agents', 'meta', 'genetic', 'hybrid', 'monitoring'];
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 5) {
        setActiveTab(ids[n - 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { data: agents } = useSWR('/api/ai/agents', fetcher);
  const { data: metaModels } = useSWR('/api/ai/meta-learning', fetcher);
  const { data: gaResults } = useSWR('/api/ai/genetic-algorithm', fetcher);
  const { data: hybridModels } = useSWR('/api/ai/hybrid', fetcher);
  const { data: monitoring } = useSWR('/api/ai/monitoring', fetcher);

  const tabs = [
    { id: 'agents', label: 'AI Agents', count: agents?.agents?.length || 0 },
    { id: 'meta', label: 'Meta-Learning', count: metaModels?.models?.length || 0 },
    { id: 'genetic', label: 'Genetic Algorithm', count: gaResults?.results?.currentGeneration || 0 },
    { id: 'hybrid', label: 'Hybrid Models', count: hybridModels?.models?.length || 0 },
    { id: 'monitoring', label: 'Monitoring', count: monitoring?.data?.alerts?.length || 0 }
  ];

  const renderAgents = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">AI Trading Agents</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Agent
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents?.agents?.map((agent: any) => (
          <div key={agent.id} className="ds-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{agent.name}</h4>
              <span className={`px-2 py-1 rounded text-xs ${
                agent.status === 'active' ? 'bg-emerald-900 text-emerald-300' : 'bg-gray-900 text-gray-300'
              }`}>
                {agent.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="capitalize">{agent.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Accuracy:</span>
                <span className="text-emerald-400">{(agent.performance.accuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Profit:</span>
                <span className="text-emerald-400">+{(agent.performance.profit * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Trades:</span>
                <span>{agent.performance.trades}</span>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => setSelectedAgent(agent.id)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 text-sm rounded hover:bg-blue-700"
              >
                Details
              </button>
              <button className="flex-1 bg-gray-600 text-white px-3 py-2 text-sm rounded hover:bg-gray-700">
                {agent.status === 'active' ? 'Stop' : 'Start'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMetaLearning = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Meta-Learning Models</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Train Model
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {metaModels?.models?.map((model: any) => (
          <div key={model.id} className="ds-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{model.name}</h4>
              <span className={`px-2 py-1 rounded text-xs ${
                model.status === 'active' ? 'bg-emerald-900 text-emerald-300' : 
                model.status === 'training' ? 'bg-yellow-900 text-yellow-300' : 'bg-gray-900 text-gray-300'
              }`}>
                {model.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Base Accuracy:</span>
                  <div className="text-emerald-400">{(model.performance.baseAccuracy * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-gray-400">Adapted Accuracy:</span>
                  <div className="text-emerald-400">{(model.performance.adaptedAccuracy * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-gray-400">Adaptation Time:</span>
                  <div>{model.performance.adaptationTime}s</div>
                </div>
                <div>
                  <span className="text-gray-400">Memory Usage:</span>
                  <div>{(model.performance.memoryUsage * 100).toFixed(1)}%</div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-sm text-gray-400 mb-2">Recent Tasks:</div>
                <div className="space-y-1">
                  {model.tasks?.slice(0, 3).map((task: any, index: number) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>{task.symbol || task.regime}</span>
                      <span className="text-emerald-400">{(task.adaptationScore * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGeneticAlgorithm = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Genetic Algorithm Evolution</h3>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Evolve
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Optimize
          </button>
        </div>
      </div>
      
      {gaResults?.results && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="ds-card p-4">
            <h4 className="font-semibold mb-3">Evolution Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Generation:</span>
                <span className="text-blue-400">{gaResults.results.currentGeneration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Best Fitness:</span>
                <span className="text-emerald-400">{(gaResults.results.bestFitness * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average Fitness:</span>
                <span>{(gaResults.results.averageFitness * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          <div className="ds-card p-4">
            <h4 className="font-semibold mb-3">Top Genomes</h4>
            <div className="space-y-2">
              {gaResults.results.population?.slice(0, 3).map((genome: any, index: number) => (
                <div key={genome.id} className="flex justify-between items-center text-sm">
                  <span>Genome {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">{(genome.fitness * 100).toFixed(1)}%</span>
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${genome.fitness * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="ds-card p-4">
            <h4 className="font-semibold mb-3">Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Generations:</span>
                <span>{gaResults.results.statistics.totalGenerations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Convergence Rate:</span>
                <span className="text-emerald-400">{(gaResults.results.statistics.convergenceRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Diversity:</span>
                <span>{(gaResults.results.statistics.diversity * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stagnation:</span>
                <span className="text-yellow-400">{gaResults.results.statistics.stagnationCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHybridModels = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Hybrid Models</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Model
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {hybridModels?.models?.map((model: any) => (
          <div key={model.id} className="ds-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{model.name}</h4>
              <span className={`px-2 py-1 rounded text-xs ${
                model.status === 'active' ? 'bg-emerald-900 text-emerald-300' : 
                model.status === 'training' ? 'bg-yellow-900 text-yellow-300' : 'bg-gray-900 text-gray-300'
              }`}>
                {model.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Overall Accuracy:</span>
                  <div className="text-emerald-400">{(model.performance.overallAccuracy * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-gray-400">Profit:</span>
                  <div className="text-emerald-400">+{(model.performance.profit * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-gray-400">Sharpe Ratio:</span>
                  <div>{model.performance.sharpe.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Win Rate:</span>
                  <div>{(model.performance.winRate * 100).toFixed(1)}%</div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-sm text-gray-400 mb-2">Components:</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Neural ({model.components.neural.type}):</span>
                    <span className="text-emerald-400">{(model.components.neural.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Rules ({model.components.rules.type}):</span>
                    <span className="text-emerald-400">{(model.components.rules.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Ensemble ({model.components.ensemble.method}):</span>
                    <span className="text-emerald-400">{(model.components.ensemble.accuracy * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">System Monitoring</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Health Check
        </button>
      </div>
      
      {monitoring?.data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="ds-card p-4">
            <h4 className="font-semibold mb-3">System Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`${monitoring.data.system.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {monitoring.data.system.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime:</span>
                <span className="text-emerald-400">{monitoring.data.system.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Response Time:</span>
                <span>{monitoring.data.system.responseTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Error Rate:</span>
                <span className="text-red-400">{(monitoring.data.system.errorRate * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
          
          <div className="ds-card p-4">
            <h4 className="font-semibold mb-3">Models</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span>{monitoring.data.models.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active:</span>
                <span className="text-emerald-400">{monitoring.data.models.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Training:</span>
                <span className="text-yellow-400">{monitoring.data.models.training}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average Accuracy:</span>
                <span className="text-emerald-400">{(monitoring.data.models.accuracy.average * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          <div className="ds-card p-4">
            <h4 className="font-semibold mb-3">Agents</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(monitoring.data.agents).map(([type, data]: [string, any]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-gray-400 capitalize">{type}:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">{data.active}</span>
                    <span className="text-xs text-gray-500">({(data.accuracy * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="ds-card p-4">
            <h4 className="font-semibold mb-3">Alerts</h4>
            <div className="space-y-2">
              {monitoring.data.alerts?.slice(0, 3).map((alert: any) => (
                <div key={alert.id} className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      alert.severity === 'warning' ? 'bg-yellow-400' :
                      alert.severity === 'error' ? 'bg-red-400' : 'bg-blue-400'
                    }`}></span>
                    <span className="text-gray-400 text-xs">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 mt-1">{alert.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'agents': return renderAgents();
      case 'meta': return renderMetaLearning();
      case 'genetic': return renderGeneticAlgorithm();
      case 'hybrid': return renderHybridModels();
      case 'monitoring': return renderMonitoring();
      default: return renderAgents();
    }
  };

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">AI Systems Lab</h1>
        <div className="text-sm text-gray-400">
          Advanced AI trading systems control center
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-gray-600 text-xs rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
}
