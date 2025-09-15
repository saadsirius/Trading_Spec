"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { OverviewPayload } from '@/lib/types/overview';
import { OverviewHeader } from './OverviewHeader';
import { KPICard } from './KPICard';
import { EquityChart } from './EquityChart';
import { PnLCard } from './PnLCard';
import { PositionsTable } from './PositionsTable';
import { OrdersTable } from './OrdersTable';
import { Watchlist } from './Watchlist';
import { NotificationTray } from './NotificationTray';
import { useOverviewSSE } from './hooks/useOverviewSSE';

interface OverviewPageProps {
  mode: 'paper' | 'live';
}

export function OverviewPage({ mode }: OverviewPageProps) {
  const [overviewData, setOverviewData] = useState<OverviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SSE hook for real-time updates
  const { isConnected, lastUpdate } = useOverviewSSE(mode, (data) => {
    setOverviewData(prev => prev ? { ...prev, ...data } : null);
  });

  useEffect(() => {
    fetchOverviewData();
  }, [mode]);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/overview?mode=${mode}`);
      const result = await response.json();
      
      if (result.success) {
        setOverviewData(result.data);
      } else {
        setError(result.error || 'Failed to fetch overview data');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <OverviewSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="glass p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Error Loading Overview</h2>
          <p className="text-white/60 mb-4">{error}</p>
          <button
            onClick={fetchOverviewData}
            className="btn-glass px-4 py-2 text-white hover:bg-white/15"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="glass p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">No Data Available</h2>
          <p className="text-white/60">Unable to load overview data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* Header */}
      <OverviewHeader 
        mode={mode} 
        asOf={overviewData.asOf}
        isConnected={isConnected}
        lastUpdate={lastUpdate}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* KPI Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard
              title="Equity"
              value={overviewData.kpis.equity}
              format="currency"
              trend={overviewData.kpis.totalPnL}
            />
            <KPICard
              title="Cash"
              value={overviewData.kpis.cash}
              format="currency"
            />
            <KPICard
              title="Day P&L"
              value={overviewData.kpis.dayPnL}
              format="currency"
              trend={overviewData.kpis.dayPnL}
              showTrend
            />
            <KPICard
              title="Total P&L"
              value={overviewData.kpis.totalPnL}
              format="currency"
              trend={overviewData.kpis.totalPnL}
              showTrend
            />
            <KPICard
              title="Margin Used"
              value={overviewData.kpis.marginUsed}
              format="currency"
            />
          </section>

          {/* Charts Row */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <EquityChart data={overviewData.equityCurve} />
            </div>
            <div>
              <PnLCard dayPnL={overviewData.kpis.dayPnL} />
            </div>
          </section>

          {/* Tables Row */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PositionsTable positions={overviewData.positions} mode={mode} />
            <OrdersTable orders={overviewData.orders} mode={mode} />
          </section>

          {/* Bottom Row */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Watchlist items={overviewData.watchlist} mode={mode} />
            <NotificationTray notifications={overviewData.notifications} mode={mode} />
          </section>
        </motion.div>
      </main>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="min-h-screen bg-ink">
      {/* Header Skeleton */}
      <div className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-32 bg-white/10 rounded animate-pulse"></div>
              <div className="h-6 w-20 bg-white/10 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-64 bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass p-6">
                <div className="h-4 w-16 bg-white/10 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-24 bg-white/10 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-12 bg-white/10 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass p-6">
              <div className="h-64 bg-white/10 rounded animate-pulse"></div>
            </div>
            <div className="glass p-6">
              <div className="h-64 bg-white/10 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Tables Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="glass p-6">
                <div className="h-6 w-32 bg-white/10 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="h-12 bg-white/10 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="glass p-6">
                <div className="h-48 bg-white/10 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
