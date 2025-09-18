export default function PortfolioPage(){
  // TODO brancher tes positions Alpaca & PnL réel ici
  const kpis = [
    { k:'Valeur Totale', v:'$100,000' },
    { k:'PnL Jour', v:'+ $420' },
    { k:'PnL MTD', v:'+ $2,100' },
    { k:'CAGR (Backtest)', v:'18.5%' },
    { k:'Max DD', v:'-12.8%' },
  ];
  const allocations = [
    { k:'Tech', v:42 }, { k:'Health', v:18 }, { k:'Energy', v:12 }, { k:'Cash', v:28 }
  ];
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Portfolio</h1>
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map(x=>(
          <div key={x.k} className="p-4 rounded-md border border-neutral-800">
            <div className="text-xs opacity-70">{x.k}</div>
            <div className="text-lg font-semibold">{x.v}</div>
          </div>
        ))}
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Allocations</h2>
        <div className="text-sm opacity-80">Tech 42% · Health 18% · Energy 12% · Cash 28%</div>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Watchlist & Alertes</h2>
        <div className="text-sm opacity-70">Ajoute tes symboles sur /historique?symbol=XYZ et configure règles dans l'état Zustand (src/state/watchlist.ts).</div>
      </section>
    </div>
  );
}
