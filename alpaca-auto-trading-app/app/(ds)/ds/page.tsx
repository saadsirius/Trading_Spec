'use client';
import { Card, Kpi, MoodBar } from '@/design-system/atoms';
import PriceDepth from '@/design-system/three/PriceDepth';
import { useUI } from '@/state/timeTravel';

export default function DSPage() {
  const ui = useUI();
  const points = Array.from({ length: 180 }, (_, i) => 100 + Math.sin(i / 15) * 4 + Math.cos(i / 7) * 2 + (i % 13 === 0 ? 2 : 0));
  
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Design System — Démo</h1>
      <div className="grid-page">
        <Card>
          <div className="flex items-center justify-between">
            <Kpi label="Sharpe (simulé)" value="1.28" hint="+0.12 vs 30j" />
            <Kpi label="VaR 95%" value="-2.4%" hint="Jour" />
            <Kpi label="Drawdown" value="-6.1%" hint="30j" />
          </div>
          <div className="mt-3"><MoodBar /></div>
          <div className="mt-3 text-sm">
            Timeframe: <b>{ui.state.timeframe}</b> • Dense: {ui.state.denseMode ? 'oui' : 'non'} • Humeur: {Math.round(ui.state.mood * 100)}%
          </div>
          <div className="mt-2 flex gap-2">
            <button className="badge" onClick={() => useUI.getState().set({ timeframe: '15m' })}>15m</button>
            <button className="badge" onClick={() => useUI.getState().set({ timeframe: '1H' })}>1h</button>
            <button className="badge" onClick={() => useUI.getState().set({ timeframe: '1D' })}>1D</button>
            <button className="badge" onClick={() => useUI.getState().rewind(1)}>⏪ Rewind</button>
          </div>
        </Card>
        <PriceDepth points={points} />
      </div>
    </div>
  );
}
