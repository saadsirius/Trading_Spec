export type Side = 'buy'|'sell';
export type OrderType = 'market'|'limit'|'stop'|'stop_limit';

export interface PlaceOrderPayload {
  symbol: string; 
  side: Side; 
  qty: number;
  type: OrderType;
  limitPrice?: number; 
  stopPrice?: number;
  timeInForce?: 'day'|'gtc'|'opg'|'cls'|'ioc'|'fok';
  clientOrderId?: string;
  mode: 'paper'|'live';
}

export interface OrderResult {
  ok: boolean;
  data?: any;
  error?: string;
}
