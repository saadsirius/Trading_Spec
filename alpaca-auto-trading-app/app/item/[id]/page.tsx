// FILE: app/item/[id]/page.tsx
// Enhanced dynamic page for generic [id] entities (assets, portfolios, etc.)
// Same UX pattern as [symbol].

import dynamic from 'next/dynamic';
import { Metadata } from 'next';

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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = params.id?.toUpperCase?.() ?? 'UNKNOWN';
  return {
    title: `Entity ${id} — Chart & Analytics`,
    description: `Analytics and chart view for entity ${id}.`,
  };
}

export default async function ItemPage({ params }: { params: { id: string } }) {
  const id = params.id?.toUpperCase?.() ?? 'DEFAULT';

  return (
    <main className="p-5 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Entity {id}</h1>
        <span className="badge bg-green-600/20 text-green-400 border border-green-600/30">
          ID
        </span>
      </header>

      <section className="glass p-0" data-testid="chart-container">
        <EquityChart data={[]} title={`Entity ${id} — Chart`} />
      </section>

      <section className="glass p-6 space-y-2">
        <h2 className="text-lg font-semibold">Entity Insights</h2>
        <p className="text-sm text-gray-400">
          Contextual analytics or AI-generated insights will render here.
        </p>
      </section>
    </main>
  );
}
