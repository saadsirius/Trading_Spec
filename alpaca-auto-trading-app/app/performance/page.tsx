"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  IChartApi,
  ISeriesApi,
  Time,
  LineData,
  HistogramData,
  AreaData,
} from "lightweight-charts";
import clsx from "clsx";

type PerformanceMetrics = {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number; // negative %
  winRate: number;     // %
  profitFactor: number;
  volatility: number;  // %
  calmarRatio: number;
};

type PerformanceData = {
  date: string;   // "YYYY-MM-DD" or ISO date
  equity: number;
  returns: number;   // e.g. daily pct or absolute
  drawdown: number;  // negative values down to 0
  benchmark?: number;
};

export default function Performance() {
  const [timeframe, setTimeframe] = useState<"1M" | "3M" | "6M" | "1Y" | "ALL">("1Y");

  // containers
  const equityEl = useRef<HTMLDivElement | null>(null);
  const returnsEl = useRef<HTMLDivElement | null>(null);
  const ddEl = useRef<HTMLDivElement | null>(null);

  // charts + series (kept stable)
  const chartRefEq = useRef<IChartApi | null>(null);
  const chartRefRet = useRef<IChartApi | null>(null);
  const chartRefDD = useRef<IChartApi | null>(null);

  const seriesRefEq = useRef<ISeriesApi<"Line"> | null>(null);
  const seriesRefRet = useRef<ISeriesApi<"Histogram"> | null>(null);
  const seriesRefDD = useRef<ISeriesApi<"Area"> | null>(null);

  const roRef = useRef<ResizeObserver | null>(null);

  // Fetch data
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ["performance", timeframe],
    queryFn: async (): Promise<PerformanceData[]> => {
      const res = await fetch(`/api/performance?timeframe=${timeframe}`);
      if (!res.ok) throw new Error("Failed to fetch performance data");
      return res.json();
    },
  });

  const { data: metrics } = useQuery({
    queryKey: ["performance-metrics", timeframe],
    queryFn: async (): Promise<PerformanceMetrics> => {
      const res = await fetch(`/api/performance/metrics?timeframe=${timeframe}`);
      if (!res.ok) throw new Error("Failed to fetch performance metrics");
      return res.json();
    },
  });

  // Map once (cheap) & stable
  const mapped = useMemo(() => {
    const eq: LineData[] = [];
    const rets: HistogramData[] = [];
    const dd: AreaData[] = [];
    if (!performanceData?.length) return { eq, rets, dd };

    for (const d of performanceData) {
      const t = (d.date as unknown) as Time; // string dates are supported
      eq.push({ time: t, value: d.equity });
      rets.push({ time: t, value: d.returns, color: d.returns >= 0 ? "#26a69a" : "#ef5350" });
      dd.push({ time: t, value: d.drawdown });
    }
    return { eq, rets, dd };
  }, [performanceData]);

  // Init charts once (client-side)
  useEffect(() => {
    let disposed = false;

    async function init() {
      const elsReady = equityEl.current && returnsEl.current && ddEl.current;
      if (!elsReady) return;

      // dynamic import keeps initial bundle light and avoids SSR surprises
      const { createChart } = await import("lightweight-charts");
      if (disposed) return;

      // Shared opts
      const base = {
        layout: { background: { color: "#1a1a1a" }, textColor: "#d1d4dc" },
        grid: {
          vertLines: { color: "#2B2B43" },
          horzLines: { color: "#2B2B43" },
        },
        crosshair: { mode: 1 as const },
        rightPriceScale: { borderColor: "#485c7b" },
        timeScale: { borderColor: "#485c7b" },
      };

      // Create charts
      const eq = createChart(equityEl.current!, {
        ...base,
        width: equityEl.current!.clientWidth,
        height: 320,
      });
      const rt = createChart(returnsEl.current!, {
        ...base,
        width: returnsEl.current!.clientWidth,
        height: 220,
      });
      const dd = createChart(ddEl.current!, {
        ...base,
        width: ddEl.current!.clientWidth,
        height: 220,
      });

      chartRefEq.current = eq;
      chartRefRet.current = rt;
      chartRefDD.current = dd;

      // Add series (once)
      seriesRefEq.current = eq.addLineSeries({ color: "#2962FF", lineWidth: 2 });
      seriesRefRet.current = rt.addHistogramSeries({
        color: "#26a69a",
        priceFormat: { type: "price", precision: 4, minMove: 0.0001 },
      });
      seriesRefDD.current = dd.addAreaSeries({
        topColor: "rgba(239,83,80,0.30)",
        bottomColor: "rgba(239,83,80,0.00)",
        lineColor: "#ef5350",
        lineWidth: 2,
      });

      // First data render
      if (mapped.eq.length) {
        seriesRefEq.current.setData(mapped.eq);
        eq.timeScale().fitContent();
      }
      if (mapped.rets.length) {
        seriesRefRet.current.setData(mapped.rets);
        rt.timeScale().fitContent();
      }
      if (mapped.dd.length) {
        seriesRefDD.current.setData(mapped.dd);
        dd.timeScale().fitContent();
      }

      // ResizeObserver (one observer for three charts)
      const ro = new ResizeObserver(() => {
        if (!equityEl.current || !returnsEl.current || !ddEl.current) return;
        eq.applyOptions({ width: equityEl.current.clientWidth });
        rt.applyOptions({ width: returnsEl.current.clientWidth });
        dd.applyOptions({ width: ddEl.current.clientWidth });
      });
      ro.observe(equityEl.current!);
      ro.observe(returnsEl.current!);
      ro.observe(ddEl.current!);
      roRef.current = ro;
    }

    init();

    return () => {
      disposed = true;
      if (roRef.current) {
        try { roRef.current.disconnect(); } catch {}
        roRef.current = null;
      }
      if (chartRefEq.current) { try { chartRefEq.current.remove(); } catch {}; chartRefEq.current = null; }
      if (chartRefRet.current) { try { chartRefRet.current.remove(); } catch {}; chartRefRet.current = null; }
      if (chartRefDD.current) { try { chartRefDD.current.remove(); } catch {}; chartRefDD.current = null; }
      seriesRefEq.current = null;
      seriesRefRet.current = null;
      seriesRefDD.current = null;
    };
  // initialize only once; mapped lengths don't recreate charts
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update series data when API changes (no re-create)
  useEffect(() => {
    if (seriesRefEq.current && mapped.eq.length) {
      seriesRefEq.current.setData(mapped.eq);
      chartRefEq.current?.timeScale().fitContent();
    }
    if (seriesRefRet.current && mapped.rets.length) {
      seriesRefRet.current.setData(mapped.rets);
      chartRefRet.current?.timeScale().fitContent();
    }
    if (seriesRefDD.current && mapped.dd.length) {
      seriesRefDD.current.setData(mapped.dd);
      chartRefDD.current?.timeScale().fitContent();
    }
  }, [mapped.eq, mapped.rets, mapped.dd]);

  // UI helpers
  const getMetricColor = (value: number, type: "positive" | "negative" | "neutral" = "neutral") => {
    if (type === "positive") return value >= 0 ? "text-green-400" : "text-red-400";
    if (type === "negative") return value <= 0 ? "text-green-400" : "text-red-400";
    return value >= 0 ? "text-green-400" : "text-red-400";
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Performance Analytics</h1>
        <div className="flex space-x-2">
          {(["1M", "3M", "6M", "1Y", "ALL"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={clsx(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                timeframe === period ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Metric label="Total Return" value={`${metrics.totalReturn.toFixed(2)}%`} cls={getMetricColor(metrics.totalReturn)} />
          <Metric label="Annualized" value={`${metrics.annualizedReturn.toFixed(2)}%`} cls={getMetricColor(metrics.annualizedReturn)} />
          <Metric label="Sharpe Ratio" value={metrics.sharpeRatio.toFixed(2)} cls={getMetricColor(metrics.sharpeRatio)} />
          <Metric label="Max Drawdown" value={`${metrics.maxDrawdown.toFixed(2)}%`} cls={getMetricColor(metrics.maxDrawdown, "negative")} />
          <Metric label="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} cls={getMetricColor(metrics.winRate - 50)} />
          <Metric label="Profit Factor" value={metrics.profitFactor.toFixed(2)} cls={getMetricColor(metrics.profitFactor - 1)} />
          <Metric label="Volatility" value={`${metrics.volatility.toFixed(2)}%`} cls="text-yellow-400" />
          <Metric label="Calmar Ratio" value={metrics.calmarRatio.toFixed(2)} cls={getMetricColor(metrics.calmarRatio)} />
        </div>
      )}

      {/* Charts */}
      <section className="grid grid-cols-1 gap-6">
        <Panel title="Equity Curve">
          {isLoading ? <Loader /> : <div ref={equityEl} className="w-full h-80" data-testid="equity-chart" />}
        </Panel>

        <Panel title="Daily Returns">
          {isLoading ? <Loader /> : <div ref={returnsEl} className="w-full h-60" data-testid="returns-chart" />}
        </Panel>

        <Panel title="Drawdown">
          {isLoading ? <Loader /> : <div ref={ddEl} className="w-full h-60" data-testid="drawdown-chart" />}
        </Panel>
      </section>

      {/* Summary */}
      {metrics && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3 text-green-400">Strengths</h3>
              <ul className="space-y-2 text-sm">
                {metrics.sharpeRatio > 1 && (
                  <Row left="Strong risk-adjusted returns" right={`Sharpe: ${metrics.sharpeRatio.toFixed(2)}`} rightCls="text-green-400" />
                )}
                {metrics.winRate > 60 && (
                  <Row left="High win rate" right={`${metrics.winRate.toFixed(1)}%`} rightCls="text-green-400" />
                )}
                {metrics.profitFactor > 1.5 && (
                  <Row left="Good profit factor" right={metrics.profitFactor.toFixed(2)} rightCls="text-green-400" />
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3 text-red-400">Areas for Improvement</h3>
              <ul className="space-y-2 text-sm">
                {metrics.maxDrawdown < -10 && (
                  <Row left="High maximum drawdown" right={`${metrics.maxDrawdown.toFixed(2)}%`} rightCls="text-red-400" />
                )}
                {metrics.volatility > 20 && (
                  <Row left="High volatility" right={`${metrics.volatility.toFixed(2)}%`} rightCls="text-yellow-400" />
                )}
                {metrics.sharpeRatio < 0.5 && (
                  <Row left="Low risk-adjusted returns" right={`Sharpe: ${metrics.sharpeRatio.toFixed(2)}`} rightCls="text-red-400" />
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ————— Little UI bits ————— */

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Metric({ label, value, cls }: { label: string; value: string | number; cls?: string }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="text-sm text-gray-400">{label}</div>
      <div className={clsx("text-xl font-bold", cls)}>{value}</div>
    </div>
  );
}

function Row({ left, right, rightCls }: { left: string; right: string; rightCls?: string }) {
  return (
    <li className="flex justify-between">
      <span>{left}</span>
      <span className={rightCls}>{right}</span>
    </li>
  );
}

function Loader() {
  return <div className="text-gray-400">Loading chart...</div>;
}