import 'dotenv/config';
import { fetchNews } from '@/src/lib/api/news';
import { fetchEarnings, fetchMacro } from '@/src/lib/api/calendar';
import { aggregateDailyPnL, cumulative } from '@/src/services/pnl';
import PnLCumulated from '@/src/components/charts/PnLCumulated';
import NewsList from '@/src/components/NewsList';
import CalendarList from '@/src/components/CalendarList';

// Mock trades demo; remplace par tes trades réels (ou via API interne)
const demoTrades = [
  { ts: '2025-01-02T13:00:00Z', symbol:'AAPL', side:'buy',  qty:10, price:180 },
  { ts: '2025-01-05T13:00:00Z', symbol:'AAPL', side:'sell', qty:10, price:184 },
  { ts: '2025-01-08T13:00:00Z', symbol:'NVDA', side:'buy',  qty:5,  price:500 },
  { ts: '2025-01-20T13:00:00Z', symbol:'NVDA', side:'sell', qty:5,  price:470 },
] as const;

export default async function HistoriquePage({ searchParams }: { searchParams: { symbol?: string } }) {
  const symbol = searchParams?.symbol || 'AAPL';

  // PnL journalier (mock)
  const daily = aggregateDailyPnL(demoTrades as any);
  const cumu = cumulative(daily);

  // News + Calendar (providers avec fallbacks)
  const [news, earn, macro] = await Promise.all([
    fetchNews(symbol),
    fetchEarnings(symbol),
    fetchMacro()
  ]);
  const calendar = [...earn, ...macro].sort((a,b)=> (a.date||'').localeCompare(b.date||''));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Historique & Analyse</h1>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">PnL Cumulé (Journalier)</h2>
        <PnLCumulated data={cumu}/>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold">News & Sentiment ({symbol})</h2>
          <div className="mt-3"><NewsList items={news}/></div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Calendar (Earnings + Macro)</h2>
          <div className="mt-3"><CalendarList items={calendar}/></div>
        </div>
      </section>
    </div>
  );
}
