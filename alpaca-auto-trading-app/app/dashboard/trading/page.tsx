'use client';
import dynamic from 'next/dynamic';
import { memo, useMemo, useState } from 'react';
import { useIndices } from '@/lib/data/hooks';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useMarketStream } from '@/lib/ws/useMarketStream';
import { useMarket } from '@/state/marketStore';
import { Toasts } from '@/lib/toast/ToastService';

const ChartTV = dynamic(()=>import('@/components/ChartTV'), { ssr:false });

type RowItem = { symbol:string; price:number; changePct:number };

export default function TradingDashboard() {
  const [selected, setSelected] = useState<string>('SPY');
  const [timeframe, setTimeframe] = useState<'1Day'|'1Hour'|'15Min'|'5Min'>('1Day');
  const [filter, setFilter] = useState('');
  const universe = useMemo(()=>['SPY','QQQ','DIA','IWM','XLK','XLF','XLE','XLY','XLP','XLV','XLI','XLU','SMH','ARKK','EEM','TLT'],[]);
  const { data: indices = [], isLoading } = useIndices(universe);

  // stream temps réel pour l'universe + selected
  useMarketStream({ symbols: Array.from(new Set([selected, ...universe])) });
  const ticks = useMarket(s=>s.ticks);

  const rows: RowItem[] = useMemo(() => {
    return indices
      .map(i => {
        const tick = ticks[i.symbol];
        const price = tick?.p ?? i.price;
        return { ...i, price };
      })
      .filter(r => !filter.trim() || r.symbol.includes(filter.toUpperCase()));
  }, [indices, ticks, filter]);

  return (
    <div className="p-3 space-y-3" id="TradingDashboard">
      <h1 className="text-xl font-semibold">TradingDashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-3">
        <aside className="rounded border p-2 space-y-2" id="IndexList">
          <div className="flex items-center gap-2">
            <input
              className="w-full rounded border px-2 py-1 text-sm"
              placeholder="Filtrer symboles…"
              value={filter}
              onChange={e=>setFilter(e.target.value)}
            />
          </div>
          <div className="h-[520px]">
            {/* Liste virtualisée */}
            <AutoSizer>
              {({ width, height }: any) => (
                <List
                  height={height} width={width} itemCount={rows.length} itemSize={44}
                  itemData={{ rows, onPick: (s: string) => setSelected(s) }}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          </div>
          <TradeButtons symbol={selected} />
        </aside>

        <main className="space-y-2">
          <FilterPanel timeframe={timeframe} onChangeTF={setTimeframe} />
          <div className="rounded border p-2" id="ChartComponent">
            {/* Chart par symbole */}
            <ChartTV symbol={selected} />
          </div>
        </main>
      </div>
    </div>
  );
}

// Row virtualisé (mémoïsé)
const Row = memo(({ index, style, data }: any) => {
  const { rows, onPick } = data;
  const r = rows[index] as RowItem;
  const ch = (r.changePct*100).toFixed(2);
  return (
    <div style={style} className="px-2 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
         onClick={()=>onPick(r.symbol)}
         id={`row-${r.symbol}`}>
      <div className="font-mono text-sm">{r.symbol}</div>
      <div className="flex items-center gap-3">
        <div className="font-mono text-sm">{r.price.toFixed(2)}</div>
        <div className={`text-xs ${r.changePct>=0 ? 'text-green-600':'text-red-600'}`}>{ch}%</div>
      </div>
    </div>
  );
});
Row.displayName = 'Row';

// Panneau filtres
function FilterPanel({ timeframe, onChangeTF }:{ timeframe:string; onChangeTF:(tf:any)=>void }) {
  const TFs = ['5Min','15Min','1Hour','1Day'] as const;
  return (
    <div className="rounded border p-2 flex items-center gap-2" id="FilterPanel">
      <div className="text-sm text-gray-600">Timeframe:</div>
      {TFs.map(tf => (
        <button key={tf} onClick={()=>onChangeTF(tf)}
          className={`px-2 py-1 text-xs rounded border ${timeframe===tf?'bg-gray-900 text-white dark:bg-white dark:text-gray-900':''}`}>
          {tf}
        </button>
      ))}
    </div>
  );
}

// Boutons d'ordre
function TradeButtons({ symbol }:{ symbol:string }) {
  const place = async (side:'buy'|'sell') => {
    const r = await fetch('/api/alpaca/orders', {
      method:'POST',
      headers:{ 'content-type':'application/json' },
      body: JSON.stringify({ symbol, side, qty: 1, type:'market', time_in_force:'day' })
    });
    const j = await r.json().catch(()=>({}));
    if (r.ok) Toasts.show('Ordre envoyé', `${side.toUpperCase()} ${symbol}`);
    else Toasts.show('Erreur ordre', j?.error ?? 'orders_error');
  };
  return (
    <div className="flex items-center gap-2" id="TradeButtons">
      <button onClick={()=>place('buy')} className="flex-1 rounded bg-green-600 text-white px-3 py-2 text-sm">Acheter</button>
      <button onClick={()=>place('sell')} className="flex-1 rounded bg-red-600 text-white px-3 py-2 text-sm">Vendre</button>
    </div>
  );
}
