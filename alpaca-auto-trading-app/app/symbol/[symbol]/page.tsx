// FILE: app/symbol/[symbol]/page.tsx
// Enhanced dynamic page for stock/asset symbols.
// Stable SSR-safe skeleton with hydration via EquityChart.

import dynamic from 'next/dynamic';
import { Metadata } from 'next';

// Lazy-load chart (SSR disabled)
const EquityChart = dynamic(
  () => import('@/components/charts/EquityChart').then((m) => m.EquityChart),
  {
    ssr: false,
    loading: () => (
      <div
        className="glass p-6 space-y-4"
        data-testid="chart-container"
      >
        <div className="animate-pulse h-8 w-1/3 bg-gray-700 rounded" />
        <div className="animate-pulse h-64 bg-gray-700 rounded" />
      </div>
    ),
  }
);

// Optional: SEO-friendly metadata
export async function generateMetadata({ params }: { params: { symbol: string } }): Promise<Metadata> {
  const symbol = (params.symbol || 'AAPL').toUpperCase();
  return {
    title: `${symbol} Stock Price & Chart`,
    description: `Interactive chart and price data for ${symbol}.`,
  };
}

export default async function SymbolPage({ params }: { params: { symbol: string } }) {
  const symbol = (params.symbol || 'AAPL').toUpperCase();

  return (
    <main className="p-5 space-y-6">
      {/* Page header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{symbol} — Overview</h1>
        <span className="badge bg-blue-600/20 text-blue-400 border border-blue-600/30">
          Symbol
        </span>
      </header>

      {/* Chart container */}
      <section className="glass p-0" data-testid="chart-container">
        <EquityChart data={[]} title={`${symbol} — Price`} symbol={symbol} />
      </section>

      {/* Placeholder for tabs / future widgets */}
      <section className="glass p-6 space-y-2">
        <h2 className="text-lg font-semibold">Details</h2>
        <p className="text-sm text-gray-400">
          Additional financials, ratios, and AI insights will appear here.
        </p>
      </section>
    </main>
  );
}
