import { create } from 'zustand';

type AlertRule =
 | { kind:'sentiment'; symbol:string; threshold:number }     // -1..+1
 | { kind:'volatility'; symbol:string; days:30|90; threshold:number } // %
 | { kind:'breakout'; symbol:string; lookback:number; }      // Donchian high

interface WatchlistState {
  symbols: string[];
  alerts: AlertRule[];
  addSymbol: (s:string)=>void;
  removeSymbol: (s:string)=>void;
  addAlert: (a:AlertRule)=>void;
  removeAlert: (idx:number)=>void;
}

export const useWatchlist = create<WatchlistState>((set)=>({
  symbols: [],
  alerts: [],
  addSymbol: (s)=> set((st)=> st.symbols.includes(s) ? st : ({...st, symbols:[...st.symbols,s]})),
  removeSymbol: (s)=> set((st)=> ({...st, symbols: st.symbols.filter(x=>x!==s)})),
  addAlert: (a)=> set((st)=> ({...st, alerts:[...st.alerts, a]})),
  removeAlert: (idx)=> set((st)=> ({...st, alerts: st.alerts.filter((_,i)=> i!==idx)}))
}));
