'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ROIOverview() {
  const [activeTab, setActiveTab] = useState('evaluation');
  const [selectedSymbol, setSelectedSymbol] = useState('SPY');

  const { data: evaluation } = useSWR(`/api/roi/evaluation?symbol=${selectedSymbol}`, fetcher);
  const { data: alerts } = useSWR('/api/roi/alerts', fetcher);
  const { data: autoHeal } = useSWR('/api/roi/auto-heal', fetcher);
  const { data: prospective } = useSWR('/api/roi/prospective', fetcher);
  const { data: simulations } = useSWR('/api/roi/parallel-sims', fetcher);

  const tabs = [
    { id: 'evaluation', label: 'ROI Evaluation', count: 0 },
    { id: 'alerts', label: 'Alerts', count: alerts?.summary?.active || 0 },
    { id: 'auto-heal', label: 'Auto-Heal', count: autoHeal?.autoHeal?.statistics?.activeIncidents || 0 },
    { id: 'prospective', label: 'Prospective Memory', count: prospective?.data?.statistics?.pendingIntentions || 0 },
    { id: 'simulations', label: 'Parallel Sims', count: simulations?.summary?.running || 0 }
  ];

  const renderEvaluation = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ROI Evaluation</h3>
        <div className="flex gap-2">
          <select 
            value={selectedSymbol} 
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          >
            <option value="SPY">SPY</option>
            <option value="AAPL">AAPL</option>
            <option value="MSFT">MSFT</option>
            <option value="GOOGL">GOOGL</option>
            <option value="TSLA">TSLA</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Batch Evaluate
          </button>
        </div>
      </div>

      {evaluation?.evaluation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Metrics */}
          <div className="ds-card p-4">
            <h4 className="font-semibold mb-4">Key Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Sharpe Ratio:</span>
                <span className="text-emerald-400 font-semibold">{evaluation.evaluation.metrics.sharpe.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sortino Ratio:</span>
                <span className="text-emerald-400 font-semibold">{evaluation.evaluation.metrics.sortino.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Calmar Ratio:</span>
                <span className="text-emerald-400 font-semibold">{evaluation.evaluation.metrics.calmar.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CAGR:</span>
                <span className="text-emerald-400 font-semibold">{(evaluation.evaluation.metrics.cagr * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Drawdown:</span>
                <span className="text-red-400 font-semibold">{(evaluation.evaluation.metrics.maxDrawdown * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="ds-card p-4">
            <h4 className="font-semibold mb-4">Risk Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">VaR 95%:</span>
                <span className="text-red-400 font-semibold">{(evaluation.evaluation.metrics.var95 * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">VaR 99%:</span>
                <span className="text-red-400 font-semibold">{(evaluation.evaluation.metrics.var99 * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Volatility:</span>
                <span className="text-yellow-400 font-semibold">{(evaluation.evaluation.metrics.volatility * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Beta:</span>
                <span className="text-blue-400 font-semibold">{evaluation.evaluation.metrics.beta.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Alpha:</span>
                <span className="text-emerald-400 font-semibold">{(evaluation.evaluation.metrics.alpha * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Sensitivity Analysis */}
          <div className="ds-card p-4">
            <h4 className="font-semibold mb-4">Sensitivity Analysis</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Market:</span>
                <span className="text-blue-400 font-semibold">{evaluation.evaluation.sensitivity.market.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Interest Rate:</span>
                <span className="text-yellow-400 font-semibold">{evaluation.evaluation.sensitivity.interest.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Volatility:</span>
                <span className="text-orange-400 font-semibold">{evaluation.evaluation.sensitivity.volatility.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Liquidity:</span>
                <span className="text-green-400 font-semibold">{evaluation.evaluation.sensitivity.liquidity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sector:</span>
                <span className="text-purple-400 font-semibold">{evaluation.evaluation.sensitivity.sector.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ROI Alerts</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Alert
        </button>
      </div>

      {alerts?.alerts && (
        <div className="space-y-3">
          {alerts.alerts.map((alert: any) => (
            <div key={alert.id} className="ds-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-500' :
                    alert.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></span>
                  <h4 className="font-semibold">{alert.symbol}</h4>
                  <span className="text-sm text-gray-400 capitalize">{alert.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    alert.status === 'active' ? 'bg-red-900 text-red-300' : 'bg-gray-900 text-gray-300'
                  }`}>
                    {alert.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-3">{alert.message}</p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">Current: <span className="text-white">{alert.currentValue.toFixed(3)}</span></span>
                  <span className="text-gray-400">Threshold: <span className="text-white">{alert.threshold.toFixed(3)}</span></span>
                </div>
                <div className="flex gap-2">
                  <button className="bg-gray-600 text-white px-3 py-1 text-xs rounded hover:bg-gray-700">
                    Resolve
                  </button>
                  <button className="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700">
                    Update
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAutoHeal = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Auto-Heal System</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Trigger Heal
        </button>
      </div>

      {autoHeal?.autoHeal && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="ds-card p-4">
            <h4 className="font-semibold mb-4">System Status</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`${autoHeal.autoHeal.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {autoHeal.autoHeal.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Incidents:</span>
                <span>{autoHeal.autoHeal.statistics.totalIncidents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Resolved:</span>
                <span className="text-emerald-400">{autoHeal.autoHeal.statistics.resolvedIncidents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active:</span>
                <span className="text-red-400">{autoHeal.autoHeal.statistics.activeIncidents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Success Rate:</span>
                <span className="text-emerald-400">{(autoHeal.autoHeal.statistics.successRate * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="ds-card p-4">
            <h4 className="font-semibold mb-4">Recent Incidents</h4>
            <div className="space-y-3">
              {autoHeal.autoHeal.incidents.slice(0, 3).map((incident: any) => (
                <div key={incident.id} className="border-l-2 border-gray-700 pl-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{incident.symbol}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      incident.severity === 'high' ? 'bg-red-900 text-red-300' :
                      incident.severity === 'medium' ? 'bg-yellow-900 text-yellow-300' : 'bg-blue-900 text-blue-300'
                    }`}>
                      {incident.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{incident.details.issue}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {incident.duration ? `${incident.duration}m` : 'Ongoing'}
                    </span>
                    <span className={`${incident.success ? 'text-emerald-400' : 'text-red-400'}`}>
                      {incident.success ? 'Resolved' : 'Failed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProspective = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Prospective Memory</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Intention
        </button>
      </div>

      {prospective?.data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="ds-card p-4">
            <h4 className="font-semibold mb-4">Active Intentions</h4>
            <div className="space-y-3">
              {prospective.data.intentions.filter((i: any) => i.status === 'pending').map((intention: any) => (
                <div key={intention.id} className="border-l-2 border-blue-500 pl-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{intention.symbol}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      intention.priority === 'high' ? 'bg-red-900 text-red-300' :
                      intention.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'
                    }`}>
                      {intention.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{intention.context.reason}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Due: {new Date(intention.targetDate).toLocaleDateString()}
                    </span>
                    <span className="text-blue-400">
                      {(intention.context.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ds-card p-4">
            <h4 className="font-semibold mb-4">Reminders</h4>
            <div className="space-y-3">
              {prospective.data.reminders.map((reminder: any) => (
                <div key={reminder.id} className="border-l-2 border-yellow-500 pl-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{reminder.message}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      reminder.priority === 'high' ? 'bg-red-900 text-red-300' :
                      reminder.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'
                    }`}>
                      {reminder.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Due: {new Date(reminder.dueDate).toLocaleDateString()}
                    </span>
                    <span className="text-gray-400 capitalize">{reminder.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSimulations = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Parallel Universe Simulations</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Simulation
        </button>
      </div>

      {simulations?.simulations && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {simulations.simulations.map((sim: any) => (
            <div key={sim.id} className="ds-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">{sim.name}</h4>
                <span className={`px-2 py-1 rounded text-xs ${
                  sim.status === 'completed' ? 'bg-emerald-900 text-emerald-300' :
                  sim.status === 'running' ? 'bg-yellow-900 text-yellow-300' : 'bg-gray-900 text-gray-300'
                }`}>
                  {sim.status}
                </span>
              </div>
              
              {sim.status === 'running' && (
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{(sim.progress * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${sim.progress * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {sim.results && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Return:</span>
                    <span className={`${sim.results.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(sim.results.totalReturn * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sharpe:</span>
                    <span className="text-emerald-400">{sim.results.sharpe.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max DD:</span>
                    <span className="text-red-400">{(sim.results.maxDrawdown * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="text-emerald-400">{(sim.results.winRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}
              
              <div className="mt-3 flex gap-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 text-sm rounded hover:bg-blue-700">
                  {sim.status === 'running' ? 'Stop' : 'Analyze'}
                </button>
                <button className="flex-1 bg-gray-600 text-white px-3 py-2 text-sm rounded hover:bg-gray-700">
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'evaluation': return renderEvaluation();
      case 'alerts': return renderAlerts();
      case 'auto-heal': return renderAutoHeal();
      case 'prospective': return renderProspective();
      case 'simulations': return renderSimulations();
      default: return renderEvaluation();
    }
  };

  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">ROI Overview</h1>
        <div className="text-sm text-gray-400">
          Advanced ROI analysis and management
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
