/**
 * File: src/types/market.d.ts
 * Description: Market data types and interfaces.
 */
export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  change: number;
  changePercent: number;
}

export interface Bar {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface TickerInfo {
  symbol: string;
  name?: string;
  type: 'stock' | 'etf' | 'crypto' | 'index';
  price?: number;
  change1d?: number;
  change1w?: number;
  change1m?: number;
  volumeAvg?: number;
  marketCap?: number;
  pe?: number;
  dividendYield?: number;
  esg?: {
    score?: number;
    grade?: string;
  };
  logoUrl?: string;
  sector?: string;
  spark?: number[];
}

export interface SearchResult extends TickerInfo {
  score: number;
  reason: string;
}
