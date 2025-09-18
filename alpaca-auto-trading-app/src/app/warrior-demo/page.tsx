"use client";
import { useState, useEffect } from 'react';
import { bus } from '@/src/lib/event-bus';
import { useWatchlist } from '@/src/features/watchlist';
import { runScreener, type ScreenerQuery } from '@/src/features/screener';
import { runBacktest, type BacktestInput } from '@/src/features/backtesting';
import { notifySuccess, notifyInfo, notifyError } from '@/src/lib/ui/ToastProvider';
import type { DomainEvent, Instrument, Candle, Quote } from '@/src/core/domain';

export default function WarriorDemoPage() {
  const [events, setEvents] = useState<DomainEvent[]>([]);
  const [screenerResults, setScreenerResults] = useState<any[]>([]);
  const [backtestResults, setBacktestResults] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const { list: watchlist, add: addToWatchlist, remove: removeFromWatchlist } = useWatchlist();

  // Écouter tous les événements du bus
  useEffect(() => {
    const unsubscribe = bus.on((event) => {
      setEvents(prev => [event, ...prev.slice(0, 49)]); // Garder les 50 derniers
    });
    return unsubscribe;
  }, []);

  // Simuler des données de marché
  const simulateMarketData = () => {
    const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    // Simuler un tick de prix
    const quote: Quote = {
      t: Date.now(),
      bid: 150 + Math.random() * 10,
      ask: 150 + Math.random() * 10,
      mid: 150 + Math.random() * 10,
      spread: 0.01,
      source: 'sim'
    };
    
    bus.emit({
      type: 'QUOTE_TICK',
      symbol,
      quote
    });

    // Simuler une bougie
    const candle: Candle = {
      t: Date.now(),
      o: 150 + Math.random() * 10,
      h: 155 + Math.random() * 10,
      l: 145 + Math.random() * 10,
      c: 150 + Math.random() * 10,
      v: Math.random() * 1000000,
      tf: '1m'
    };
    
    bus.emit({
      type: 'CANDLE',
      symbol,
      candle
    });

    notifyInfo(`Données simulées pour ${symbol}`);
  };

  // Tester le screener
  const testScreener = async () => {
    const query: ScreenerQuery = {
      tf: '1d',
      minVolume: 1000000,
      universe: ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX']
    };
    
    try {
      const results = await runScreener(query);
      setScreenerResults(results);
      notifySuccess(`Screener: ${results.length} résultats trouvés`);
    } catch (error) {
      notifyError('API.BAD_REQUEST', 'Erreur screener');
    }
  };

  // Tester le backtesting
  const testBacktest = () => {
    const instrument: Instrument = {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      market: 'US',
      currency: 'USD'
    };

    // Générer des bougies fictives
    const candles: Candle[] = [];
    const now = Date.now();
    for (let i = 0; i < 100; i++) {
      candles.push({
        t: now - (100 - i) * 60000, // 1 minute par bougie
        o: 150 + Math.sin(i * 0.1) * 5,
        h: 155 + Math.sin(i * 0.1) * 5,
        l: 145 + Math.sin(i * 0.1) * 5,
        c: 150 + Math.sin(i * 0.1) * 5,
        v: 1000000 + Math.random() * 500000,
        tf: '1m'
      });
    }

    const input: BacktestInput = {
      instrument,
      candles,
      strategy: {
        id: 'simple_ma',
        onBar: () => null // Stratégie simple pour le test
      },
      startCash: 10000
    };

    const result = runBacktest(input);
    if (result.isOk()) {
      setBacktestResults(result.value);
      notifySuccess('Backtest terminé avec succès');
    } else {
      notifyError('STRATEGY.INVALID_SIGNAL', result.error.message);
    }
  };

  // Tester l'enregistrement/replay
  const toggleRecording = () => {
    if (isRecording) {
      const recorded = bus.recorder.stop();
      console.log('Événements enregistrés:', recorded);
      notifyInfo(`${recorded.length} événements enregistrés`);
    } else {
      bus.recorder.start();
      notifyInfo('Enregistrement démarré');
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="min-h-screen bg-ink p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass p-6 rounded-xl">
          <h1 className="text-3xl font-bold text-white mb-2">🚀 Warrior Trading Platform Demo</h1>
          <p className="text-white/80">
            Démonstration complète de l'architecture Warrior : Event Bus, Backtesting, Screener, Watchlist
          </p>
        </div>

        {/* Contrôles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={simulateMarketData}
            className="glass p-4 rounded-xl text-white hover:bg-white/10 transition-colors"
          >
            📈 Simuler Données Marché
          </button>
          
          <button
            onClick={testScreener}
            className="glass p-4 rounded-xl text-white hover:bg-white/10 transition-colors"
          >
            🔍 Tester Screener
          </button>
          
          <button
            onClick={testBacktest}
            className="glass p-4 rounded-xl text-white hover:bg-white/10 transition-colors"
          >
            📊 Tester Backtest
          </button>
          
          <button
            onClick={toggleRecording}
            className={`glass p-4 rounded-xl transition-colors ${
              isRecording ? 'bg-red-600 text-white' : 'text-white hover:bg-white/10'
            }`}
          >
            {isRecording ? '⏹️ Arrêter Enregistrement' : '⏺️ Démarrer Enregistrement'}
          </button>
        </div>

        {/* Watchlist */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-white mb-4">📋 Watchlist</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {['AAPL', 'TSLA', 'MSFT', 'GOOGL'].map(symbol => (
              <button
                key={symbol}
                onClick={() => addToWatchlist(symbol, { pinned: true })}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                + {symbol}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {Object.values(watchlist).map(item => (
              <div key={item.symbol} className="flex justify-between items-center p-2 bg-white/5 rounded">
                <span className="text-white">{item.symbol}</span>
                <button
                  onClick={() => removeFromWatchlist(item.symbol)}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Résultats Screener */}
        {screenerResults.length > 0 && (
          <div className="glass p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">🔍 Résultats Screener</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {screenerResults.slice(0, 6).map((result, index) => (
                <div key={index} className="p-3 bg-white/5 rounded">
                  <div className="text-white font-semibold">{result.symbol}</div>
                  <div className="text-white/70 text-sm">Score: {result.score.toFixed(2)}</div>
                  <div className="text-white/70 text-sm">TF: {result.tf}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Résultats Backtest */}
        {backtestResults && (
          <div className="glass p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">📊 Résultats Backtest</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white/5 rounded">
                <div className="text-white/70 text-sm">P&L Total</div>
                <div className="text-white font-semibold">${backtestResults.summary.pnl.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-white/5 rounded">
                <div className="text-white/70 text-sm">Max Drawdown</div>
                <div className="text-white font-semibold">${backtestResults.summary.maxDD.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-white/5 rounded">
                <div className="text-white/70 text-sm">Win Rate</div>
                <div className="text-white font-semibold">{(backtestResults.summary.winRate * 100).toFixed(1)}%</div>
              </div>
              <div className="p-3 bg-white/5 rounded">
                <div className="text-white/70 text-sm">Nb Trades</div>
                <div className="text-white font-semibold">{backtestResults.summary.nbTrades}</div>
              </div>
            </div>
          </div>
        )}

        {/* Événements en temps réel */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-white mb-4">⚡ Événements Temps Réel</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-white/70 text-center py-4">Aucun événement pour le moment</p>
            ) : (
              events.map((event, index) => (
                <div key={index} className="p-2 bg-white/5 rounded text-sm">
                  <div className="text-white font-mono">
                    <span className="text-blue-400">{event.type}</span>
                    {'symbol' in event && (
                      <span className="text-green-400 ml-2">{event.symbol}</span>
                    )}
                  </div>
                  <div className="text-white/70 text-xs">
                    {new Date('ts' in event ? event.ts : Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
