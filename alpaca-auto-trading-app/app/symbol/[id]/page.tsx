'use client';
import { useEffect } from 'react';
import { useUI } from '@/state/uiStore';
import SearchSymbol from '@/components/SearchSymbol';
import ChartPanel from '@/components/ChartPanel';
import RightPanelAlerts from '@/components/RightPanelAlerts';
import AISidePanel from '@/components/AISidePanel';

export default function SymbolPage({ params }: { params: { id: string }}) {
  const symbol = decodeURIComponent(params.id ?? 'AAPL').toUpperCase();
  const { setCurrentSymbol, timeframe } = useUI();
  useEffect(()=>{ setCurrentSymbol(symbol); return ()=>setCurrentSymbol(undefined); }, [symbol, setCurrentSymbol]);

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b p-3 flex items-center gap-3">
        <SearchSymbol />
        <div className="ml-auto text-sm text-gray-500">Symbole: <span className="font-mono">{symbol}</span> · TF: {timeframe}</div>
      </header>
      <main className="flex flex-1">
        <div className="flex-1 p-3">
          <ChartPanel symbol={symbol} />
        </div>
        <RightPanelAlerts symbol={symbol} />
        <AISidePanel />
      </main>
    </div>
  );
}
