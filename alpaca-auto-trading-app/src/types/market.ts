export type Mode = 'paper'|'live';

export interface Bar {
  t: string; // ISO
  o: number; h: number; l: number; c: number; v?: number;
}

export interface NewsItem {
  id: string;
  source: string;
  symbol?: string;
  headline: string;
  summary?: string;
  url?: string;
  publishedAt: string; // ISO
  sentiment?: number; // -1..+1
}

export interface CalendarEvent {
  id: string;
  kind: 'earning'|'macro';
  title: string;
  symbol?: string;
  country?: string;
  date: string; // ISO
  actual?: string|number;
  forecast?: string|number;
  previous?: string|number;
  importance?: 'low'|'medium'|'high';
}

export interface Factors {
  momentum: number; // 0..100
  value: number;
  quality: number;
  risk: number;   // inversé => plus haut = mieux
  growth: number;
}

export interface PnLPoint {
  date: string; // ISO day
  pnl: number;  // jour
}

export interface Trade {
  ts: string; // ISO
  symbol: string;
  side: 'buy'|'sell';
  qty: number;
  price: number;
  fee?: number;
}

export interface BacktestMetrics {
  cagr: number;
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
}
