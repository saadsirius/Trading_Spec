'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type ConfigState = {
  rateLimit: number;
  cacheTTL: number;
  logLevel: string;
  enableSSE: boolean;
  enableGraphQL: boolean;
};

export default function ConfigPanel() {
  const [config, setConfig] = useState<ConfigState>({
    rateLimit: 10,
    cacheTTL: 60,
    logLevel: 'info',
    enableSSE: true,
    enableGraphQL: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: health } = useSWR('/api/health', fetcher, {
    refreshInterval: 10000
  });

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('middleware_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse saved config:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('middleware_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setIsEditing(false);
  };

  const handleReset = () => {
    const defaultConfig: ConfigState = {
      rateLimit: 10,
      cacheTTL: 60,
      logLevel: 'info',
      enableSSE: true,
      enableGraphQL: true
    };
    setConfig(defaultConfig);
    localStorage.setItem('middleware_config', JSON.stringify(defaultConfig));
  };

  return (
    <div className="ds-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Configuration</h3>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-emerald-400">✓ Saved</span>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="badge"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Rate Limiting */}
        <div>
          <label className="text-xs text-gray-400 mb-2 block">
            Rate Limit (QPS)
          </label>
          {isEditing ? (
            <input
              type="number"
              min="1"
              max="100"
              value={config.rateLimit}
              onChange={(e) => setConfig(prev => ({ ...prev, rateLimit: Number(e.target.value) }))}
              className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded"
            />
          ) : (
            <div className="text-sm">{config.rateLimit} requests/second</div>
          )}
        </div>

        {/* Cache TTL */}
        <div>
          <label className="text-xs text-gray-400 mb-2 block">
            Cache TTL (seconds)
          </label>
          {isEditing ? (
            <input
              type="number"
              min="10"
              max="3600"
              value={config.cacheTTL}
              onChange={(e) => setConfig(prev => ({ ...prev, cacheTTL: Number(e.target.value) }))}
              className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded"
            />
          ) : (
            <div className="text-sm">{config.cacheTTL} seconds</div>
          )}
        </div>

        {/* Log Level */}
        <div>
          <label className="text-xs text-gray-400 mb-2 block">
            Log Level
          </label>
          {isEditing ? (
            <select
              value={config.logLevel}
              onChange={(e) => setConfig(prev => ({ ...prev, logLevel: e.target.value }))}
              className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded"
            >
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          ) : (
            <div className="text-sm capitalize">{config.logLevel}</div>
          )}
        </div>

        {/* Feature Toggles */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 block">Features</label>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">SSE Streaming</span>
            {isEditing ? (
              <input
                type="checkbox"
                checked={config.enableSSE}
                onChange={(e) => setConfig(prev => ({ ...prev, enableSSE: e.target.checked }))}
                className="rounded"
              />
            ) : (
              <span className={`text-xs ${config.enableSSE ? 'text-emerald-400' : 'text-gray-400'}`}>
                {config.enableSSE ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">GraphQL</span>
            {isEditing ? (
              <input
                type="checkbox"
                checked={config.enableGraphQL}
                onChange={(e) => setConfig(prev => ({ ...prev, enableGraphQL: e.target.checked }))}
                className="rounded"
              />
            ) : (
              <span className={`text-xs ${config.enableGraphQL ? 'text-emerald-400' : 'text-gray-400'}`}>
                {config.enableGraphQL ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>
        </div>

        {/* Environment Status */}
        {health && (
          <div className="pt-4 border-t border-gray-700">
            <label className="text-xs text-gray-400 mb-2 block">Environment</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Redis:</span>
                <span className={`ml-1 ${health.environment.hasRedis ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {health.environment.hasRedis ? '✓' : '✗'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Alpaca:</span>
                <span className={`ml-1 ${health.environment.hasAlpaca ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {health.environment.hasAlpaca ? '✓' : '✗'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">OpenAI:</span>
                <span className={`ml-1 ${health.environment.hasOpenAI ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {health.environment.hasOpenAI ? '✓' : '✗'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Node:</span>
                <span className="ml-1 text-emerald-400">{health.environment.nodeEnv}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-2 pt-4 border-t border-gray-700">
            <button
              onClick={handleSave}
              className="flex-1 bg-emerald-600 text-white px-3 py-2 text-sm rounded hover:bg-emerald-700"
            >
              Save
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-600 text-white px-3 py-2 text-sm rounded hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
