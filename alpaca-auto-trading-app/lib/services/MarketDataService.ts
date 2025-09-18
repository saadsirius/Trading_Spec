import { Symbol, Tick } from '@/types/market';

export class MarketDataService {
  private ws?: WebSocket;
  private listeners = new Set<(t: Tick) => void>();
  private symbols = new Set<Symbol>();
  private reconnectDelay = 1000;
  private alive = false;

  start(symbols: Symbol[]) { 
    this.symbols = new Set(symbols); 
    this.connect(); 
  }

  onTick(cb: (t: Tick) => void) { 
    this.listeners.add(cb); 
    return () => this.listeners.delete(cb); 
  }

  private connect() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      this.alive = true; 
      this.reconnectDelay = 1000;
      this.ws!.send(JSON.stringify({ type: 'subscribe', symbols: [...this.symbols] }));
      // backfill HTTP pour combler les trous
      this.backfill();
    };
    
    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'tick') this.emit(msg.data as Tick);
    };
    
    this.ws.onclose = this.retry; 
    this.ws.onerror = this.retry;
  }

  private async backfill() {
    try {
      await fetch('/api/market/backfill', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: [...this.symbols] })
      });
    } catch (e) {
      console.warn('[MarketDataService] Backfill failed:', e);
    }
  }

  private retry = () => {
    if (!this.alive) return;
    setTimeout(() => this.connect(), this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 1.8, 15000);
  };

  private emit(t: Tick) { 
    for (const l of this.listeners) l(t); 
  }

  stop() { 
    this.alive = false; 
    this.ws?.close(); 
  }
}

export const marketData = new MarketDataService();
