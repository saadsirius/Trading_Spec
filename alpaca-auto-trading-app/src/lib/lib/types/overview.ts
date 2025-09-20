export interface CurvePoint {
  time: number;
  value: number;
}

export interface CandleData {
  t: number; // timestamp
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}