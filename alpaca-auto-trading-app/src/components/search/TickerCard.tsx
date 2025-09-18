'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Props = {
  item: {
    symbol: string;
    name?: string;
    type: string;
    price?: number;
    change1d?: number;
    change1w?: number;
    change1m?: number;
    volumeAvg?: number;
    marketCap?: number;
    pe?: number;
    dividendYield?: number;
    esg?: { score?: number; grade?: string };
    logoUrl?: string;
    sector?: string;
    score?: number;
    reason?: string;
    spark?: number[];
  };
  onAddWatch?: (symbol: string) => void;
  onCompare?: (symbol: string) => void;
  onAlert?: (symbol: string) => void;
};

export default function TickerCard({ item, onAddWatch, onCompare, onAlert }: Props) {
  const [price, setPrice] = useState(item.price);
  
  useEffect(() => {
    const es = new EventSource(`/api/stream/sse?symbols=${item.symbol}`);
    es.onmessage = (ev) => { 
      try { 
        const j = JSON.parse(ev.data || '{}'); 
        if (j[item.symbol]) setPrice(j[item.symbol]); 
      } catch {} 
    };
    return () => es.close();
  }, [item.symbol]);

  return (
    <div className="ds-card p-3">
      <div className="flex gap-3 items-center">
        <img 
          src={item.logoUrl || '/favicon.ico'} 
          width={28} 
          height={28} 
          alt="" 
          className="rounded"
        />
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <Link href={`/symbol/${item.symbol}`} className="font-semibold">
              {item.symbol}
            </Link>
            <span className="text-xs text-gray-400">
              {item.name || item.type}
            </span>
            <span className="badge">{(item.sector || '—')}</span>
          </div>
          <div className="text-sm kpi mt-1">
            <b>{price?.toFixed?.(2) ?? '—'}</b>
            <span className={`ml-2 ${((item.change1d || 0) >= 0) ? 'text-emerald-400' : 'text-rose-400'}`}>
              {fmtPct(item.change1d)} / {fmtPct(item.change1w)} / {fmtPct(item.change1m)}
            </span>
          </div>
        </div>
        <div className="spark-mini">
          <ai-sparkline data={(item.spark || []).join(',')}></ai-sparkline>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-400">
        <div>
          Score ESG: <b>{item.esg?.grade || '—'}</b> 
          {(item.esg?.score != null) ? ` (${(item.esg!.score! * 100).toFixed(0)})` : ''}
        </div>
        <div>PER: <b>{item.pe ?? '—'}</b></div>
        <div>
          Div: <b>{item.dividendYield ? (item.dividendYield * 100).toFixed(1) + '%' : '—'}</b>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Score recherche: <b>{Math.round((item.score || 0) * 100)}</b> — {item.reason || '—'}
      </div>

      <div className="mt-3 flex gap-2">
        <button className="badge" onClick={() => onAddWatch?.(item.symbol)}>
          + Watchlist
        </button>
        <button className="badge" onClick={() => onCompare?.(item.symbol)}>
          Comparer
        </button>
        <Link href={`/symbol/${item.symbol}`} className="badge">
          Graphique
        </Link>
        <button className="badge" onClick={() => onAlert?.(item.symbol)}>
          Alerte IA
        </button>
      </div>
    </div>
  );
}

const fmtPct = (x?: number) => (x == null ? '—' : (x * 100).toFixed(1) + '%');
