import { ChartClickData, NavigationClickData, NotificationClickData, OrderClickData, PositionClickData, TradingMode } from './types';

class ClickHandlerService {
  private static _instance: ClickHandlerService;
  static get instance() {
    if (!this._instance) this._instance = new ClickHandlerService();
    return this._instance;
  }

  private async post<T>(url: string, body: unknown, headers: Record<string,string> = {}): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  async handleOrderClick(data: OrderClickData): Promise<boolean> {
    try {
      const idempotency = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      const resp = await this.post<{ ok: boolean }>(`/api/orders`, data, { 'x-idempotency-key': idempotency });
      return !!resp.ok;
    } catch (e) {
      console.error('[handleOrderClick]', e);
      return false;
    }
  }

  async handleQuickBuy(symbol: string, mode: TradingMode): Promise<boolean> {
    return this.handleOrderClick({ symbol, side: 'buy', quantity: 1, orderType: 'market', mode });
  }
  async handleQuickSell(symbol: string, mode: TradingMode): Promise<boolean> {
    return this.handleOrderClick({ symbol, side: 'sell', quantity: 1, orderType: 'market', mode });
  }

  async handlePositionClick(data: PositionClickData): Promise<boolean> {
    try {
      const resp = await this.post<{ ok: boolean }>(`/api/positions/${data.positionId}/${data.action}`, data);
      return !!resp.ok;
    } catch (e) { console.error('[handlePositionClick]', e); return false; }
  }

  async handleNotificationClick(data: NotificationClickData): Promise<boolean> {
    try {
      const resp = await this.post<{ ok: boolean }>(`/api/notifications/${data.notificationId}/${data.action}`, data);
      return !!resp.ok;
    } catch (e) { console.error('[handleNotificationClick]', e); return false; }
  }

  async handleChartClick(data: ChartClickData): Promise<boolean> {
    try {
      // Analytics hook could be called here
      console.debug('[chart_event]', data);
      return true;
    } catch (e) { console.error('[handleChartClick]', e); return false; }
  }

  async handleNavigationClick(data: NavigationClickData): Promise<boolean> {
    try {
      const qs = data.params ? `?${new URLSearchParams(Object.entries(data.params).map(([k,v])=>[k,String(v)]))}` : '';
      window.location.assign(`${data.route}${qs}`);
      return true;
    } catch (e) { console.error('[handleNavigationClick]', e); return false; }
  }
}

export const clickHandler = ClickHandlerService.instance;
