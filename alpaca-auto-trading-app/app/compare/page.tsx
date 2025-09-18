'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function ComparePage({ searchParams }: { searchParams: { symbols?: string } }) {
  const [rows, setRows] = useState<any[]>([]);
  const symbols = useMemo(() => 
    (searchParams.symbols || 'SPY,QQQ').split(',').slice(0, 6), 
    [searchParams.symbols]
  );

  useEffect(() => {
    (async () => {
      const arr: any[] = [];
      for (const s of symbols) {
        const r = await fetch(`/api/search?q=${encodeURIComponent(s)}`)
          .then(r => r.json());
        if (r.items?.[0]) arr.push(r.items[0]);
      }
      setRows(arr);
    })();
  }, [symbols.join(',')]);

  return (
    <div className="p-5 space-y-3">
      <h1 className="text-xl font-semibold">Comparer</h1>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-400">
            <tr>
              <th>Ticker</th>
              <th>Prix</th>
              <th>1j</th>
              <th>1s</th>
              <th>1m</th>
              <th>ESG</th>
              <th>PER</th>
              <th>Div</th>
              <th>Spark</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.symbol} className="border-b border-gray-800">
                <td className="py-2">
                  <Link href={`/symbol/${r.symbol}`} className="font-semibold">
                    {r.symbol}
                  </Link> 
                  <span className="text-xs text-gray-400">{r.name || ''}</span>
                </td>
                <td className="kpi">{r.price?.toFixed?.(2) || '—'}</td>
                <td className={`${(r.change1d || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fmt(r.change1d)}
                </td>
                <td className={`${(r.change1w || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fmt(r.change1w)}
                </td>
                <td className={`${(r.change1m || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fmt(r.change1m)}
                </td>
                <td>{r.esg?.grade || '—'}</td>
                <td>{r.pe ?? '—'}</td>
                <td>{r.dividendYield ? (r.dividendYield * 100).toFixed(1) + '%' : '—'}</td>
                <td style={{ inlineSize: 160 }}>
                  <ai-sparkline data={(r.spark || []).join(',')}></ai-sparkline>
                </td>
                <td>
                  <Link className="badge" href={`/symbol/${r.symbol}`}>
                    Graphique
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const fmt = (x?: number) => x == null ? '—' : (x * 100).toFixed(1) + '%';
