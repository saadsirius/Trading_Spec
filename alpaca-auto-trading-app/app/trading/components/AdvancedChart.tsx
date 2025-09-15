'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TrendingUp, TrendingDown, Play, Pause, BarChart3 } from 'lucide-react';

// Note: In a real app, you'd use dynamic import for lightweight-charts
// For now, we'll mock the chart functionality

interface AdvancedChartProps {
  symbol: string;
  timeframe: string;
  className?: string;
}

interface BacktestResults {
  trades: number;
  winRate: number;
  maxDD: number;
  sharpe: number;
}

interface TradingDecision {
  action: 'buy' | 'sell' | 'hold';
  reason: string;
  confidence: number;
  order?: {
    qty: number;
    side: 'buy' | 'sell';
    stop_loss?: { stop_price: number };
    take_profit?: { limit_price: number };
  };
}

interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface VolumeData {
  time: string;
  value: number;
  color: string;
}

export const AdvancedChart = ({ symbol, timeframe, className }: AdvancedChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoTrade, setAutoTrade] = useState(false);
  const [tradingDecision, setTradingDecision] = useState<TradingDecision | null>(null);
  const [backtestResults, setBacktestResults] = useState<BacktestResults | null>(null);
  const [isRunningBacktest, setIsRunningBacktest] = useState(false);

  // Auto-trade effect
  useEffect(() => {
    if (autoTrade) {
      const interval = setInterval(() => {
        executeAutoTrade();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoTrade, symbol, timeframe]);

  // Run backtest simulation
  const runBacktest = async () => {
    setIsRunningBacktest(true);
    try {
      const response = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          timeframe,
          lookback: 200
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTradingDecision(data.data.decision);
        if (data.data.backtest) {
          setBacktestResults(data.data.backtest);
        }
      } else {
        console.error('Backtest failed:', data.error);
      }
    } catch (error) {
      console.error('Backtest error:', error);
    } finally {
      setIsRunningBacktest(false);
    }
  };

  // Execute auto-trade
  const executeAutoTrade = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoTrade: true,
          symbol,
          timeframe,
          lookback: 200
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTradingDecision(data.data.decision);
        if (data.data.order) {
          // Show success notification
          console.log('Auto-trade executed:', data.data.message);
        } else {
          console.log('No trade executed:', data.data.message);
        }
      } else {
        console.error('Auto-trade failed:', data.error);
      }
    } catch (error) {
      console.error('Auto-trade error:', error);
    }
  };

  // Generate mock candlestick data
  const generateMockData = (): CandlestickData[] => {
    const data: CandlestickData[] = [];
    const basePrice = 150;
    let currentPrice = basePrice;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 100);

    for (let i = 0; i < 100; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const change = (Math.random() - 0.5) * 10;
      const open = currentPrice;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;
      
      currentPrice = close;

      data.push({
        time: date.toISOString().split('T')[0],
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
      });
    }

    return data;
  };

  // Generate mock volume data
  const generateVolumeData = (candlestickData: CandlestickData[]): VolumeData[] => {
    return candlestickData.map((candle) => ({
      time: candle.time,
      value: Math.floor(Math.random() * 1000000) + 100000,
      color: candle.close >= candle.open ? '#26a69a' : '#ef5350',
    }));
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const initializeChart = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // const { createChart } = await import('lightweight-charts');
        // Mock createChart function for build compatibility
        const createChart = (container: any, options: any) => ({
          addCandlestickSeries: (opts?: any) => ({
            setData: (data: any) => {},
          }),
          addLineSeries: (opts?: any) => ({
            setData: (data: any) => {},
          }),
          addHistogramSeries: (opts?: any) => ({
            setData: (data: any) => {},
          }),
          timeScale: () => ({
            fitContent: () => {},
          }),
          applyOptions: (opts: any) => {},
          remove: () => {},
        });
        
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 420,
          layout: {
            background: { color: '#ffffff' },
            textColor: '#333333',
          },
          grid: {
            vertLines: { color: '#f0f0f0' },
            horzLines: { color: '#f0f0f0' },
          },
          crosshair: {
            mode: 1,
          },
          rightPriceScale: {
            borderColor: '#cccccc',
            scaleMargins: {
              top: 0.1,
              bottom: 0.1,
            },
          },
          timeScale: {
            borderColor: '#cccccc',
            timeVisible: true,
            secondsVisible: false,
          },
        });

        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#26a69a',
          downColor: '#ef5350',
          borderVisible: false,
          wickUpColor: '#26a69a',
          wickDownColor: '#ef5350',
        });

        const volumeSeries = chart.addHistogramSeries({
          color: '#26a69a',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: '',
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });

        chartRef.current = chart;
        candlestickSeriesRef.current = candlestickSeries;
        volumeSeriesRef.current = volumeSeries;

        const candlestickData = generateMockData();
        const volumeData = generateVolumeData(candlestickData);

        candlestickSeries.setData(candlestickData);
        volumeSeries.setData(volumeData);

        const handleResize = () => {
          if (chartContainerRef.current && chart) {
            chart.applyOptions({
              width: chartContainerRef.current.clientWidth,
            });
          }
        };

        window.addEventListener('resize', handleResize);

        const cleanup = () => {
          window.removeEventListener('resize', handleResize);
          if (chart) {
            chart.remove();
          }
        };

        (chart as any).__cleanup = cleanup;

        setIsLoading(false);
      } catch (err) {
        console.error('Chart initialization error:', err);
        setError('Failed to initialize chart');
        setIsLoading(false);
      }
    };

    initializeChart();

    return () => {
      if (chartRef.current && (chartRef.current as any).__cleanup) {
        (chartRef.current as any).__cleanup();
      }
    };
  }, [symbol, timeframe]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        <div className="h-[420px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-white rounded-xl border border-red-200 p-6 ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{symbol}</h3>
          <div className="text-sm text-gray-500">{timeframe}</div>
        </div>
        <div className="h-[420px] bg-red-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium mb-2">Chart Error</div>
            <div className="text-red-400 text-sm">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{symbol}</h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">{timeframe}</div>
          
          {/* Auto-Trade Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoTrade(!autoTrade)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                autoTrade 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {autoTrade ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              <span>Auto-Trade</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trading Decision Display */}
      {tradingDecision && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg border"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {tradingDecision.action === 'buy' ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : tradingDecision.action === 'sell' ? (
                <TrendingDown className="w-4 h-4 text-red-600" />
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded-full" />
              )}
              <span className={`font-medium ${
                tradingDecision.action === 'buy' ? 'text-green-600' :
                tradingDecision.action === 'sell' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {tradingDecision.action.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                ({Math.round(tradingDecision.confidence * 100)}% confidence)
              </span>
            </div>
            <span className="text-sm text-gray-600">{tradingDecision.reason}</span>
          </div>
          {tradingDecision.order && (
            <div className="mt-2 text-xs text-gray-500">
              Qty: {tradingDecision.order.qty} | 
              {tradingDecision.order.stop_loss && ` Stop: $${tradingDecision.order.stop_loss.stop_price}`}
              {tradingDecision.order.take_profit && ` | Take: $${tradingDecision.order.take_profit.limit_price}`}
            </div>
          )}
        </motion.div>
      )}

      {/* Backtest Results */}
      {backtestResults && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 grid grid-cols-4 gap-4"
        >
          <Card className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{backtestResults.trades}</div>
              <div className="text-xs text-gray-500">Trades</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{Math.round(backtestResults.winRate * 100)}%</div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{Math.round(backtestResults.maxDD * 100)}%</div>
              <div className="text-xs text-gray-500">Max DD</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{backtestResults.sharpe.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Sharpe</div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Chart Controls */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          onClick={runBacktest}
          loading={isRunningBacktest}
          variant="secondary"
          size="sm"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Simulate Backtest
        </Button>
        
        {autoTrade && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Auto-trading active</span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div 
        ref={chartContainerRef} 
        className="w-full h-[420px]"
        style={{ minHeight: '420px' }}
      />
    </motion.div>
  );
};
