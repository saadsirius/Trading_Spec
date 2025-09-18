'use client';
import { useState } from 'react';

type TestResult = {
  url: string;
  method: string;
  status: number;
  responseTime: number;
  response: any;
  error?: string;
};

export default function APITester() {
  const [url, setUrl] = useState('/api/health');
  const [method, setMethod] = useState('GET');
  const [body, setBody] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    const start = Date.now();
    
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (method !== 'GET' && body.trim()) {
        options.body = body;
      }
      
      const response = await fetch(url, options);
      const responseTime = Date.now() - start;
      const responseData = await response.text();
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseData);
      } catch {
        parsedResponse = responseData;
      }
      
      const result: TestResult = {
        url,
        method,
        status: response.status,
        responseTime,
        response: parsedResponse,
      };
      
      setResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
    } catch (error: any) {
      const result: TestResult = {
        url,
        method,
        status: 0,
        responseTime: Date.now() - start,
        response: null,
        error: error.message,
      };
      
      setResults(prev => [result, ...prev.slice(0, 9)]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-400';
    if (status >= 400 && status < 500) return 'text-yellow-400';
    if (status >= 500) return 'text-rose-400';
    return 'text-gray-400';
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="ds-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">API Tester</h3>
        <button
          onClick={clearResults}
          className="text-xs text-gray-400 hover:text-gray-300"
          disabled={results.length === 0}
        >
          Clear Results
        </button>
      </div>

      <div className="space-y-4">
        {/* Request Configuration */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/api/health"
              className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded"
            />
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          
          {method !== 'GET' && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Body (JSON)</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                rows={3}
                className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 rounded font-mono"
              />
            </div>
          )}
          
          <button
            onClick={runTest}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-3 py-2 text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Run Test'}
          </button>
        </div>

        {/* Quick Test Buttons */}
        <div className="pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Quick Tests</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setUrl('/api/health');
                setMethod('GET');
                setBody('');
              }}
              className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
            >
              Health Check
            </button>
            <button
              onClick={() => {
                setUrl('/api/gw/list');
                setMethod('GET');
                setBody('');
              }}
              className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
            >
              Plugin List
            </button>
            <button
              onClick={() => {
                setUrl('/api/search?q=AAPL');
                setMethod('GET');
                setBody('');
              }}
              className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
            >
              Search Test
            </button>
            <button
              onClick={() => {
                setUrl('/api/graphql');
                setMethod('POST');
                setBody('{"query": "{ quote(symbol: \\"AAPL\\") { symbol price } }"}');
              }}
              className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
            >
              GraphQL Test
            </button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Test Results</div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="p-2 bg-gray-800 rounded text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono">{result.method} {result.url}</span>
                    <div className="flex items-center gap-2">
                      <span className={getStatusColor(result.status)}>
                        {result.status}
                      </span>
                      <span className="text-gray-400">
                        {result.responseTime}ms
                      </span>
                    </div>
                  </div>
                  
                  {result.error ? (
                    <div className="text-rose-400 font-mono">
                      Error: {result.error}
                    </div>
                  ) : (
                    <pre className="text-gray-300 font-mono text-xs overflow-x-auto">
                      {JSON.stringify(result.response, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
