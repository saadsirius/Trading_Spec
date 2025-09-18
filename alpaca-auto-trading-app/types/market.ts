export type Symbol = string;
export type UnixMs = number;

export interface Tick {
  symbol: Symbol;
  price: number;
  size?: number;
  ts: UnixMs;           // Date.now() côté client; source ts côté serveur conservée aussi
  sourceTs?: UnixMs;    // horloge exchange
}

export interface Candle {
  symbol: Symbol;
  open: number; 
  high: number; 
  low: number; 
  close: number;
  volume: number;
  startTs: UnixMs; // début intervalle
  timeframe: '1S'|'5S'|'15S'|'1m'|'5m'|'15m'|'1h'|'1d';
}

export interface PriceClick {
  symbol: Symbol;
  price: number;
  ts: UnixMs;        // ts UI
  candleStartTs?: UnixMs;
  source: 'chart'|'depth'|'ticker';
}
