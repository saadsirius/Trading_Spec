import 'dotenv/config';
import FactorsRadar from '@/src/components/charts/FactorsRadar';
import { computeFactors } from '@/src/services/factors';

export default async function SymbolPage({ params }: { params: { ticker: string } }) {
  const { ticker } = params;

  // TODO: remplace par fetch de tes fondamentaux (Polygon, Finnhub) puis computeFactors
  const f = computeFactors({
    perf6m: 22, perf12m: 48, evToEbitda: 18, pb: 9, pe: 35,
    roe: 18, roic: 12, netMargin: 20, vol30: 40, vol90: 55, maxDrawdown: -28,
    revCAGR3y: 24, epsCAGR3y: 30
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{ticker} · Pentagone (Investing Warriors)</h1>
      <FactorsRadar f={f}/>
    </div>
  );
}
