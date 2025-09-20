export interface CurvePoint {
  t: number; // timestamp
  v: number; // value
}

export interface OverviewData {
  equity: CurvePoint[];
  pnl: CurvePoint[];
  positions: any[];
  orders: any[];
}