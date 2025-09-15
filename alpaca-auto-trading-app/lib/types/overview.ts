export type KPI = { 
  equity: number; 
  cash: number; 
  dayPnL: number; 
  totalPnL: number; 
  marginUsed: number 
};

export type CurvePoint = { 
  t: string; 
  v: number 
};

export type PositionRow = { 
  id: string; 
  symbol: string; 
  name: string; 
  qty: number; 
  avg: number; 
  last: number; 
  unrealized: number; 
  unrealizedPct: number 
};

export type OrderRow = { 
  id: string; 
  t: string; 
  symbol: string; 
  side: "buy" | "sell"; 
  qty: number; 
  status: string; 
  price: number 
};

export type WatchItem = { 
  symbol: string; 
  name: string; 
  last: number; 
  changePct: number; 
  spark: number[] 
};

export type NotificationRow = { 
  id: string; 
  title: string; 
  t: string; 
  href: string 
};

export type OverviewPayload = {
  mode: "paper" | "live";
  asOf: string;
  kpis: KPI;
  equityCurve: CurvePoint[];
  positions: PositionRow[];
  orders: OrderRow[];
  watchlist: WatchItem[];
  notifications: NotificationRow[];
};

// SSE Event Types
export type SSEEvent = 
  | { type: 'KPI_UPDATE'; data: Partial<KPI> }
  | { type: 'ORDER_UPSERT'; data: OrderRow }
  | { type: 'POSITION_UPSERT'; data: PositionRow }
  | { type: 'NOTIFICATION_PUSH'; data: NotificationRow }
  | { type: 'WATCHLIST_UPDATE'; data: WatchItem[] }
  | { type: 'ping'; data: { timestamp: string } };

// Watchlist API Types
export type WatchlistAction = {
  action: 'add' | 'remove';
  symbol: string;
};

export type WatchlistResponse = {
  success: boolean;
  watchlist: WatchItem[];
  message?: string;
};