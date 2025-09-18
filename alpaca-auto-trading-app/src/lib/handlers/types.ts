export type TradingMode = 'paper' | 'live';

export interface OrderClickData {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  orderType?: 'market' | 'limit' | 'stop' | 'stop_limit';
  limitPrice?: number;
  stopPrice?: number;
  tif?: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  mode: TradingMode;
  meta?: Record<string, unknown>;
}

export interface PositionClickData {
  symbol: string;
  positionId: string;
  action: 'close' | 'modify' | 'view';
  payload?: Record<string, unknown>;
}

export interface NotificationClickData {
  notificationId: string;
  action: 'read' | 'dismiss' | 'view';
}

export interface ChartClickData {
  symbol: string;
  event: 'price_click' | 'crosshair_move' | 'timeframe_change' | 'symbol_change' | 'indicator_toggle';
  value?: number;
  timestampIso?: string;
  params?: Record<string, unknown>;
}

export interface NavigationClickData {
  route: string;
  params?: Record<string, string | number | boolean>;
}

export interface HandlerResult {
  ok: boolean;
  message?: string;
  code?: string;
}
