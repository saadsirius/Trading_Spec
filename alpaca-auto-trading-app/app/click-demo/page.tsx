'use client';
import { useState, useEffect } from 'react';
import { useOrderHandlers } from '@/lib/handlers/useClickHandlers';
import { useChartHandlers } from '@/lib/hooks/useChartHandlers';
import { useAlerts } from '@/lib/hooks/useAlerts';
import { marketData } from '@/lib/services/MarketDataService';
import { analytics } from '@/lib/services/AnalyticsService';
import { risk } from '@/lib/services/RiskService';

export default function Page() {
  const { quickBuy, isLoading, error } = useOrderHandlers('paper');
  const { onPriceClick, getLastPriceClick } = useChartHandlers();
  const { alerts, dismissAlert, confirmAlert, clearAll, isEnabled, setIsEnabled } = useAlerts();
  const [lastTick, setLastTick] = useState<any>(null);
  const [riskState, setRiskState] = useState(risk.getState());

  // Initialiser les services
  useEffect(() => {
    // Démarrer le service de données de marché
    marketData.start(['AAPL', 'TSLA', 'MSFT']);
    
    // Écouter les ticks
    const unsubscribe = marketData.onTick((tick) => {
      setLastTick(tick);
      onPriceClick({
        symbol: tick.symbol,
        price: tick.price,
        ts: tick.ts,
        source: 'ticker'
      });
    });

    // Démarrer l'analytics auto-flush
    analytics.startAutoFlush();

    return () => {
      unsubscribe();
      marketData.stop();
    };
  }, [onPriceClick]);

  const handleQuickBuy = async () => {
    const result = await quickBuy('AAPL');
    if (result) {
      risk.recordOrder();
      analytics.track('order.quickBuy.success', { symbol: 'AAPL' });
    } else {
      risk.recordFailure({ maxDailyLoss: 1000, maxPositionSizePct: 0.1, maxOrdersPerMinute: 10, pauseAfterNFailures: 3 });
      analytics.track('order.quickBuy.failed', { symbol: 'AAPL' });
    }
    setRiskState(risk.getState());
  };

  const simulatePriceClick = () => {
    const price = 150 + Math.random() * 10;
    onPriceClick({
      symbol: 'AAPL',
      price,
      ts: Date.now(),
      source: 'chart'
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="glass p-6 rounded-xl">
        <h1 className="text-2xl font-bold text-white mb-4">🚀 Trading System Demo</h1>
        <p className="text-white/80 mb-6">
          Démonstration complète du système de trading avec WebSocket, alertes IA, gestion des risques et analytics.
        </p>
      </div>

      {/* Contrôles principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">📈 Actions de Trading</h2>
          <div className="space-y-3">
            <button
              onClick={handleQuickBuy}
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60 hover:bg-green-700 transition-colors"
            >
              {isLoading ? 'Placing Order…' : 'Quick Buy AAPL'}
            </button>
            
            <button
              onClick={simulatePriceClick}
              className="w-full border border-white/20 text-white px-4 py-2 rounded hover:bg-white/10 transition-colors"
            >
              Simulate Price Click
            </button>
            
            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                Error: {error}
              </div>
            )}
          </div>
        </div>

        <div className="glass p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">⚡ Données Temps Réel</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/70">Dernier tick:</span>
              <span className="text-white">
                {lastTick ? `${lastTick.symbol}: $${lastTick.price.toFixed(2)}` : 'Aucun'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Dernier clic:</span>
              <span className="text-white">
                {getLastPriceClick() ? `$${getLastPriceClick()?.price.toFixed(2)}` : 'Aucun'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gestion des risques */}
      <div className="glass p-6 rounded-xl">
        <h2 className="text-lg font-semibold text-white mb-4">🛡️ État des Risques</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-white/70">P&L quotidien:</span>
            <div className="text-white font-mono">${riskState.dailyPnl.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-white/70">Échecs:</span>
            <div className="text-white font-mono">{riskState.failures}</div>
          </div>
          <div>
            <span className="text-white/70">Commandes/min:</span>
            <div className="text-white font-mono">{riskState.lastMinuteCount}</div>
          </div>
          <div>
            <span className="text-white/70">Pause jusqu'à:</span>
            <div className="text-white font-mono">
              {riskState.pausedUntil > Date.now() ? 
                new Date(riskState.pausedUntil).toLocaleTimeString() : 
                'Aucune'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Alertes IA */}
      <div className="glass p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">🤖 Alertes IA</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`px-3 py-1 rounded text-sm ${
                isEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
              }`}
            >
              {isEnabled ? 'Activé' : 'Désactivé'}
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Effacer tout
            </button>
          </div>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="text-white/70 text-center py-4">Aucune alerte IA</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded border ${
                  alert.actionable 
                    ? 'border-green-500 bg-green-900/20' 
                    : 'border-yellow-500 bg-yellow-900/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{alert.symbol}</span>
                      <span className="text-xs px-2 py-1 rounded bg-white/20 text-white">
                        {alert.kind}
                      </span>
                      <span className="text-xs text-white/70">
                        {Math.round(alert.confidence * 100)}% confiance
                      </span>
                    </div>
                    <p className="text-sm text-white/80 mt-1">{alert.reason}</p>
                    <p className="text-xs text-white/60 mt-1">
                      Prix: ${alert.price.toFixed(2)} • {new Date(alert.ts).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    {alert.actionable && (
                      <button
                        onClick={() => confirmAlert(alert.id)}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Confirmer
                      </button>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                    >
                      Ignorer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}