'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import clsx from 'clsx';

interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  volatility: number;
  calmarRatio: number;
}

interface PerformanceData {
  date: string;
  equity: number;
  returns: number;
  drawdown: number;
  benchmark?: number;
}

export default function Performance() {
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('1Y');
  const [chartType, setChartType] = useState<'equity' | 'returns' | 'drawdown'>('equity');
  
  const equityChartRef = useRef<HTMLDivElement>(null);
  const returnsChartRef = useRef<HTMLDivElement>(null);
  const drawdownChartRef = useRef<HTMLDivElement>(null);
  
  const [equityChart, setEquityChart] = useState<IChartApi | null>(null);
  const [returnsChart, setReturnsChart] = useState<IChartApi | null>(null);
  const [drawdownChart, setDrawdownChart] = useState<IChartApi | null>(null);

  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['performance', timeframe],
    queryFn: async (): Promise<PerformanceData[]> => {
      const res = await fetch(`/api/performance?timeframe=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch performance data');
      return res.json();
    }
  });

  const { data: metrics } = useQuery({
    queryKey: ['performance-metrics', timeframe],
    queryFn: async (): Promise<PerformanceMetrics> => {
      const res = await fetch(`/api/performance/metrics?timeframe=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch performance metrics');
      return res.json();
    }
  });

  // Initialize charts
  useEffect(() => {
    if (!equityChartRef.current || equityChart) return;

    const newEquityChart = createChart(equityChartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1a1a1a' },
        textColor: '#d1d4dc',
      },
      width: equityChartRef.current.clientWidth,
      height: 300,
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#485c7b',
      },
      timeScale: {
        borderColor: '#485c7b',
      },
    });

    const newReturnsChart = createChart(returnsChartRef.current!, {
      layout: {
        background: { type: ColorType.Solid, color: '#1a1a1a' },
        textColor: '#d1d4dc',
      },
      width: returnsChartRef.current!.clientWidth,
      height: 200,
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      rightPriceScale: {
        borderColor: '#485c7b',
      },
      timeScale: {
        borderColor: '#485c7b',
      },
    });

    const newDrawdownChart = createChart(drawdownChartRef.current!, {
      layout: {
        background: { type: ColorType.Solid, color: '#1a1a1a' },
        textColor: '#d1d4dc',
      },
      width: drawdownChartRef.current!.clientWidth,
      height: 200,
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      rightPriceScale: {
        borderColor: '#485c7b',
      },
      timeScale: {
        borderColor: '#485c7b',
      },
    });

    setEquityChart(newEquityChart);
    setReturnsChart(newReturnsChart);
    setDrawdownChart(newDrawdownChart);

    return () => {
      newEquityChart.remove();
      newReturnsChart.remove();
      newDrawdownChart.remove();
    };
  }, [equityChart, returnsChart, drawdownChart]);

  // Update chart data
  useEffect(() => {
    if (!performanceData || !equityChart || !returnsChart || !drawdownChart) return;

    // Clear existing series
    equityChart.removeSeries(equityChart.series());
    returnsChart.removeSeries(returnsChart.series());
    drawdownChart.removeSeries(drawdownChart.series());

    // Equity curve
    const equitySeries = equityChart.addLineSeries({
      color: '#2962FF',
      lineWidth: 2,
    });
    equitySeries.setData(performanceData.map(d => ({
      time: d.date,
      value: d.equity,
    })));

    // Returns
    const returnsSeries = returnsChart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
    });
    returnsSeries.setData(performanceData.map(d => ({
      time: d.date,
      value: d.returns,
      color: d.returns >= 0 ? '#26a69a' : '#ef5350',
    })));

    // Drawdown
    const drawdownSeries = drawdownChart.addAreaSeries({
      topColor: 'rgba(239, 83, 80, 0.3)',
      bottomColor: 'rgba(239, 83, 80, 0.0)',
      lineColor: '#ef5350',
      lineWidth: 2,
    });
    drawdownSeries.setData(performanceData.map(d => ({
      time: d.date,
      value: d.drawdown,
    })));

  }, [performanceData, equityChart, returnsChart, drawdownChart]);

  const getMetricColor = (value: number, type: 'positive' | 'negative' | 'neutral' = 'neutral') => {
    if (type === 'positive') return value >= 0 ? 'text-green-400' : 'text-red-400';
    if (type === 'negative') return value <= 0 ? 'text-green-400' : 'text-red-400';
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Performance Analytics</h1>
        <div className="flex space-x-2">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={clsx(
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                timeframe === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Total Return</div>
            <div className={clsx('text-xl font-bold', getMetricColor(metrics.totalReturn))}>
              {metrics.totalReturn.toFixed(2)}%
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Annualized</div>
            <div className={clsx('text-xl font-bold', getMetricColor(metrics.annualizedReturn))}>
              {metrics.annualizedReturn.toFixed(2)}%
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Sharpe Ratio</div>
            <div className={clsx('text-xl font-bold', getMetricColor(metrics.sharpeRatio))}>
              {metrics.sharpeRatio.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Max Drawdown</div>
            <div className={clsx('text-xl font-bold', getMetricColor(metrics.maxDrawdown, 'negative'))}>
              {metrics.maxDrawdown.toFixed(2)}%
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Win Rate</div>
            <div className={clsx('text-xl font-bold', getMetricColor(metrics.winRate - 50))}>
              {metrics.winRate.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Profit Factor</div>
            <div className={clsx('text-xl font-bold', getMetricColor(metrics.profitFactor - 1))}>
              {metrics.profitFactor.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Volatility</div>
            <div className="text-xl font-bold text-yellow-400">
              {metrics.volatility.toFixed(2)}%
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Calmar Ratio</div>
            <div className={clsx('text-xl font-bold', getMetricColor(metrics.calmarRatio))}>
              {metrics.calmarRatio.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Equity Curve */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Equity Curve</h2>
          {isLoading ? (
            <div className="text-gray-400">Loading chart...</div>
          ) : (
            <div ref={equityChartRef} className="w-full h-80" />
          )}
        </div>

        {/* Returns Distribution */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Daily Returns</h2>
          {isLoading ? (
            <div className="text-gray-400">Loading chart...</div>
          ) : (
            <div ref={returnsChartRef} className="w-full h-60" />
          )}
        </div>

        {/* Drawdown Chart */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Drawdown</h2>
          {isLoading ? (
            <div className="text-gray-400">Loading chart...</div>
          ) : (
            <div ref={drawdownChartRef} className="w-full h-60" />
          )}
        </div>
      </div>

      {/* Performance Summary */}
      {metrics && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3 text-green-400">Strengths</h3>
              <ul className="space-y-2 text-sm">
                {metrics.sharpeRatio > 1 && (
                  <li className="flex justify-between">
                    <span>Strong risk-adjusted returns</span>
                    <span className="text-green-400">Sharpe: {metrics.sharpeRatio.toFixed(2)}</span>
                  </li>
                )}
                {metrics.winRate > 60 && (
                  <li className="flex justify-between">
                    <span>High win rate</span>
                    <span className="text-green-400">{metrics.winRate.toFixed(1)}%</span>
                  </li>
                )}
                {metrics.profitFactor > 1.5 && (
                  <li className="flex justify-between">
                    <span>Good profit factor</span>
                    <span className="text-green-400">{metrics.profitFactor.toFixed(2)}</span>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3 text-red-400">Areas for Improvement</h3>
              <ul className="space-y-2 text-sm">
                {metrics.maxDrawdown < -10 && (
                  <li className="flex justify-between">
                    <span>High maximum drawdown</span>
                    <span className="text-red-400">{metrics.maxDrawdown.toFixed(2)}%</span>
                  </li>
                )}
                {metrics.volatility > 20 && (
                  <li className="flex justify-between">
                    <span>High volatility</span>
                    <span className="text-yellow-400">{metrics.volatility.toFixed(2)}%</span>
                  </li>
                )}
                {metrics.sharpeRatio < 0.5 && (
                  <li className="flex justify-between">
                    <span>Low risk-adjusted returns</span>
                    <span className="text-red-400">Sharpe: {metrics.sharpeRatio.toFixed(2)}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
