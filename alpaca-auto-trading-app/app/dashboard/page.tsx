"use client";

/**
 * File: app/dashboard/page.tsx
 * Purpose: Trading Dashboard (paper-trading by default) with safe client fetch,
 *          better UX (skeletons, empty states), retryable AI signals, and a11y.
 * Notes:
 *  - Keeps your components: GlassButton, InstrumentScreener, PortfolioDetail, WhyInvest
 *  - Uses AbortController for race-safe fetch on tab change/unmount
 *  - Adds data-testid hooks for e2e (Playwright) and a11y labels
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Search,
  Settings,
  User,
  Bell,
} from "lucide-react";

import GlassButton from "../components/GlassButton";
import InstrumentScreener from "../components/InstrumentScreener";
import { PortfolioDetail } from "../(trading)/components/PortfolioDetail";
import WhyInvest from "../components/WhyInvest";

type Mode = "paper" | "live";
type Tab = "discover" | "portfolio" | "signals";

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  mode: Mode;
}

interface DashboardData {
  instruments: any[];
  portfolioData: any[];
  aiSignals: any[];
  watchlist: any[];
  user: DashboardUser;
}

const DEFAULT_USER: DashboardUser = {
  id: "demo",
  name: "Demo User",
  email: "demo@example.com",
  mode: "paper",
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // For safe cancellation of in-flight requests on unmount or refetch
  const abortRef = useRef<AbortController | null>(null);

  const startAbort = () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    return abortRef.current.signal;
  };

  const fetchJSON = async <T,>(url: string, signal: AbortSignal): Promise<T> => {
    const res = await fetch(url, { signal, credentials: "same-origin", cache: "no-store" });
    if (!res.ok) {
      const msg = await safeErrorText(res);
      throw new Error(`${res.status} ${res.statusText} — ${msg}`);
    }
    return res.json();
  };

  const safeErrorText = async (res: Response) => {
    try {
      const text = await res.text();
      return text?.slice(0, 300) || "Request failed";
    } catch {
      return "Request failed";
    }
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setErr(null);
    const signal = startAbort();

    try {
      // Parallel fetch (discover, portfolio, signals)
      const [instruments, portfolio, signals] = await Promise.all([
        fetchJSON<{ instruments: any[] }>("/api/discover?limit=100", signal),
        fetchJSON<{ portfolioData: any[] }>(
          "/api/portfolio?userId=demo&mode=paper",
          signal
        ),
        fetchJSON<{ signals: any[] }>(
          "/api/signals?userId=demo&limit=10",
          signal
        ),
      ]);

      setData({
        instruments: instruments?.instruments ?? [],
        portfolioData: portfolio?.portfolioData ?? [],
        aiSignals: signals?.signals ?? [],
        watchlist: [], // TODO: connect to /api/watchlist
        user: DEFAULT_USER,
      });
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error("[Dashboard] load error:", e);
        setErr(e?.message ?? "Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    return () => abortRef.current?.abort();
  }, [loadDashboard]);

  const handleGenerateSignals = useCallback(async () => {
    if (!data) return;

    // Basic retry w/ exponential backoff (max 3 attempts)
    const maxAttempts = 3;
    let attempt = 0;
    let delay = 600; // ms

    while (attempt < maxAttempts) {
      try {
        const signal = startAbort();

        await fetch("/api/signals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.user.id,
            generateForAll: true,
            timeframe: "1D",
          }),
          signal,
        });

        // Re-fetch signals only
        const updated = await fetchJSON<{ signals: any[] }>(
          `/api/signals?userId=${data.user.id}&limit=10`,
          signal
        );

        setData((prev) =>
          prev
            ? {
                ...prev,
                aiSignals: updated?.signals ?? [],
              }
            : prev
        );
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        if (attempt === maxAttempts - 1) {
          console.error("[Signals] generate error:", e);
          setErr(e?.message ?? "Failed to generate signals");
        } else {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
        }
        attempt++;
      }
    }
  }, [data]);

  const tabDefs = useMemo(
    () => [
      { id: "discover" as const, label: "Discover", icon: Search },
      { id: "portfolio" as const, label: "Portfolio", icon: BarChart3 },
      { id: "signals" as const, label: "AI Signals", icon: TrendingUp },
    ],
    []
  );

  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="dashboard-skeleton">
        <div className="glass p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4" />
          <p className="text-white/80">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="dashboard-error">
        <div className="glass p-8 text-center">
          <p className="text-white/80">{err || "Failed to load dashboard data"}</p>
          <GlassButton onClick={loadDashboard} className="mt-4">
            Retry
          </GlassButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink" data-testid="dashboard-root">
      {/* Header */}
      <header className="glass border-b border-white/10" role="banner">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Trading Dashboard</h1>
              <span
                aria-live="polite"
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.user.mode === "live"
                    ? "bg-accent/20 text-accent"
                    : "bg-secondary/20 text-secondary"
                }`}
                title={data.user.mode === "live" ? "Live Trading" : "Paper Trading"}
              >
                {data.user.mode === "live" ? "Live Trading" : "Paper Trading"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={handleGenerateSignals}
                className="whitespace-nowrap"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate AI Signals
              </GlassButton>

              <button
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-white/70" />
              </button>
              <button
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-white/70" />
              </button>
              <button
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-4" role="navigation" aria-label="Dashboard tabs">
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1" data-testid="dashboard-tabs">
          {tabDefs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === id
                  ? "bg-secondary/20 text-secondary"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
              aria-current={activeTab === id ? "page" : undefined}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 pb-10" role="main">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          {activeTab === "discover" && (
            <section className="space-y-6" aria-label="Discover instruments" data-testid="tab-discover">
              <InstrumentScreener
                instruments={data.instruments}
                onInstrumentSelect={setSelectedInstrument}
                className="mb-6"
              />
              {selectedInstrument ? (
                <WhyInvest instrument={selectedInstrument} />
              ) : data.instruments.length === 0 ? (
                <EmptyState
                  title="No instruments available"
                  desc="Try refreshing or adjust your filters."
                  onRetry={loadDashboard}
                />
              ) : null}
            </section>
          )}

          {activeTab === "portfolio" && (
            <section aria-label="Portfolio" data-testid="tab-portfolio">
              <PortfolioDetail mode={data.user.mode} />
            </section>
          )}

          {activeTab === "signals" && (
            <section aria-label="AI Signals" data-testid="tab-signals">
              <AISignalsPanel signals={data.aiSignals} />
            </section>
          )}
        </motion.div>
      </main>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* AI Signals Panel                                                           */
/* ────────────────────────────────────────────────────────────────────────── */

function AISignalsPanel({ signals }: { signals: any[] }) {
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return signals;
    return signals.filter((s) => s.signalType?.toLowerCase() === filter);
  }, [signals, filter]);

  const totals = useMemo(() => {
    const total = signals.length;
    const buy = signals.filter((s) => s.signalType === "BUY").length;
    const sell = signals.filter((s) => s.signalType === "SELL").length;
    const avgConf =
      total > 0
        ? Math.round(
            signals.reduce((acc: number, s: any) => acc + (s.confidence || 0), 0) / total
          )
        : 0;
    return { total, buy, sell, avgConf };
  }, [signals]);

  const colorForSignal = (type?: string) =>
    (type || "").toLowerCase() === "buy"
      ? "text-support"
      : (type || "").toLowerCase() === "sell"
      ? "text-danger-400"
      : "text-white/60";

  const bgForSignal = (type?: string) =>
    (type || "").toLowerCase() === "buy"
      ? "bg-support/20"
      : (type || "").toLowerCase() === "sell"
      ? "bg-danger-500/20"
      : "bg-white/10";

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="glass p-6" data-testid="signals-summary">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">AI Trading Signals</h2>
          <div className="flex items-center gap-2" role="tablist" aria-label="Signals filter">
            {(["all", "buy", "sell"] as const).map((ft) => (
              <button
                key={ft}
                onClick={() => setFilter(ft)}
                role="tab"
                aria-selected={filter === ft}
                className={`px-3 py-1 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === ft
                    ? "bg-secondary/20 text-secondary"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {ft}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Stat label="Total Signals" value={totals.total} />
          <Stat label="Buy Signals" value={totals.buy} className="text-support" />
          <Stat label="Sell Signals" value={totals.sell} className="text-danger-400" />
          <Stat label="Avg Confidence" value={`${totals.avgConf}%`} />
        </div>
      </div>

      {/* List */}
      <div className="glass" data-testid="signals-list">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Recent Signals</h3>
        </div>

        <div className="divide-y divide-white/5">
          {filtered.map((signal) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${bgForSignal(
                      signal.signalType
                    )} ${colorForSignal(signal.signalType)}`}
                  >
                    {signal.signalType}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-semibold text-white truncate">{signal.symbol}</h4>
                    <p className="text-sm text-white/60 truncate">{signal.name}</p>
                  </div>

                  <div className="ml-auto text-right">
                    <div className="text-white font-medium">
                      {signal.currentPrice ? `$${signal.currentPrice.toFixed(2)}` : "N/A"}
                    </div>
                    <div
                      className={`text-sm ${
                        (signal.priceChange ?? 0) >= 0 ? "text-support" : "text-danger-400"
                      }`}
                    >
                      {(signal.priceChange ?? 0) >= 0 ? "+" : ""}
                      {(signal.priceChange ?? 0).toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <KV label="Strength" value={`${signal.strength ?? 0}%`} />
                  <KV label="Confidence" value={`${signal.confidence ?? 0}%`} accent="secondary" />
                  <KV
                    label="Risk"
                    value={signal.riskLevel ?? "—"}
                    tone={
                      signal.riskLevel === "LOW"
                        ? "support"
                        : signal.riskLevel === "MEDIUM"
                        ? "warning"
                        : signal.riskLevel === "HIGH"
                        ? "danger"
                        : "muted"
                    }
                  />
                  {signal.stopLoss != null && signal.takeProfit != null && (
                    <div className="text-right">
                      <div className="text-sm text-white">SL: ${signal.stopLoss.toFixed(2)}</div>
                      <div className="text-sm text-white">TP: ${signal.takeProfit.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </div>

              {Array.isArray(signal.reasoning) && signal.reasoning.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h5 className="text-sm font-medium text-white mb-2">Analysis</h5>
                  <div className="flex flex-wrap gap-2">
                    {signal.reasoning.map((reason: string, i: number) => (
                      <span key={i} className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-white/60">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No signals found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Small Presentational Helpers                                               */
/* ────────────────────────────────────────────────────────────────────────── */

function EmptyState({
  title,
  desc,
  onRetry,
}: {
  title: string;
  desc?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="glass p-8 text-center" role="status" aria-live="polite">
      <p className="text-white font-semibold mb-2">{title}</p>
      {desc && <p className="text-white/70 mb-4">{desc}</p>}
      {onRetry && (
        <GlassButton onClick={onRetry}>
          Refresh
        </GlassButton>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${className || "text-white"}`}>{value}</div>
      <div className="text-sm text-white/60">{label}</div>
    </div>
  );
}

function KV({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: string | number;
  accent?: "secondary";
  tone?: "support" | "warning" | "danger" | "muted";
}) {
  const toneClass =
    tone === "support"
      ? "text-support"
      : tone === "warning"
      ? "text-warning-500"
      : tone === "danger"
      ? "text-danger-400"
      : "text-white/80";

  const valueClass = accent === "secondary" ? "text-secondary" : toneClass;

  return (
    <div className="text-center">
      <div className={`text-lg font-semibold ${valueClass}`}>{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  );
}