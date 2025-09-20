'use client';
import { create } from 'zustand';
import { distinctUntilChanged, throttleTime, Subject } from 'rxjs';

export type Quote = { 
  s: string;  // symbol
  p: number;  // price
  t: number;  // timestamp
  v?: number; // volume
  c?: number; // change
};

export type StreamState = { 
  quotes: Record<string, Quote>; 
  push: (q: Quote) => void;
  getQuote: (symbol: string) => Quote | undefined;
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
};

// Subject RxJS pour le stream
const stream$ = new Subject<Quote>();

export const useStream = create<StreamState>((set, get) => ({
  quotes: {},
  isConnected: false,
  
  push: (q: Quote) => {
    stream$.next(q);
  },
  
  getQuote: (symbol: string) => {
    return get().quotes[symbol];
  },
  
  setConnected: (connected: boolean) => {
    set({ isConnected: connected });
  }
}));

// Opérateurs RxJS pour réduire le bruit et optimiser les performances
stream$
  .pipe(
    throttleTime(250), // Throttle à 250ms
    distinctUntilChanged((a, b) => a.s === b.s && a.p === b.p) // Évite les doublons
  )
  .subscribe(q => {
    useStream.setState(state => ({ 
      quotes: { ...state.quotes, [q.s]: q } 
    }));
  });

// Store pour les alertes en temps réel
export type AlertState = {
  alerts: Array<{
    id: string;
    symbol: string;
    type: 'price' | 'indicator' | 'sentiment';
    condition: any;
    triggered: boolean;
    triggeredAt?: number;
  }>;
  addAlert: (alert: Omit<AlertState['alerts'][0], 'id' | 'triggered'>) => void;
  removeAlert: (id: string) => void;
  checkAlerts: (quote: Quote) => void;
};

export const useAlerts = create<AlertState>((set, get) => ({
  alerts: [],
  
  addAlert: (alert) => {
    const id = crypto.randomUUID();
    set(state => ({
      alerts: [...state.alerts, { ...alert, id, triggered: false }]
    }));
  },
  
  removeAlert: (id) => {
    set(state => ({
      alerts: state.alerts.filter(a => a.id !== id)
    }));
  },
  
  checkAlerts: (quote) => {
    const { alerts } = get();
    alerts.forEach(alert => {
      if (alert.symbol === quote.s && !alert.triggered) {
        // Logique de vérification des conditions
        // Pour l'instant, simulation simple
        if (alert.type === 'price' && Math.random() > 0.95) {
          set(state => ({
            alerts: state.alerts.map(a => 
              a.id === alert.id 
                ? { ...a, triggered: true, triggeredAt: Date.now() }
                : a
            )
          }));
        }
      }
    });
  }
}));
