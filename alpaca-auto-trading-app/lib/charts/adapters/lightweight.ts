import { Candle, Tick } from '@/types/market';
import { useChartHandlers } from '@/lib/hooks/useChartHandlers';

export interface ChartAdapter {
  init(container: HTMLElement, symbol: string): void;
  updateCandles(candles: Candle[]): void;
  addTick(tick: Tick): void;
  setTimeframe(timeframe: string): void;
  destroy(): void;
}

export class LightweightChartsAdapter implements ChartAdapter {
  private chart: any = null;
  private candlestickSeries: any = null;
  private symbol: string = '';
  private handlers: ReturnType<typeof useChartHandlers>;

  constructor() {
    this.handlers = useChartHandlers();
  }

  init(container: HTMLElement, symbol: string) {
    this.symbol = symbol;
    
    // Import dynamique de Lightweight Charts
    import('lightweight-charts').then(({ createChart }) => {
      this.chart = createChart(container, {
        width: container.clientWidth,
        height: 400,
        layout: {
          background: { color: '#1e1e1e' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: '#2B2B43' },
          horzLines: { color: '#2B2B43' },
        },
        crosshair: {
          mode: 1, // Normal crosshair mode
        },
        rightPriceScale: {
          borderColor: '#485c7b',
        },
        timeScale: {
          borderColor: '#485c7b',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      this.candlestickSeries = this.chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      // Gestion des clics sur le chart
      this.chart.subscribeClick((param: any) => {
        if (param.point) {
          const price = this.candlestickSeries.coordinateToPrice(param.point.y);
          const time = this.chart.coordinateToTime(param.point.x);
          
          this.handlers.onPriceClick({
            symbol: this.symbol,
            price: price || 0,
            ts: Date.now(),
            candleStartTs: time,
            source: 'chart'
          });
        }
      });

      // Gestion du changement de timeframe
      this.chart.timeScale().subscribeVisibleTimeRangeChange(() => {
        // Debounced dans useChartHandlers
        this.handlers.onTimeframeChange(this.symbol, '1m');
      });
    });
  }

  updateCandles(candles: Candle[]) {
    if (!this.candlestickSeries) return;

    const formattedCandles = candles.map(candle => ({
      time: candle.startTs / 1000, // Lightweight Charts attend des timestamps en secondes
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    this.candlestickSeries.setData(formattedCandles);
  }

  addTick(tick: Tick) {
    if (!this.candlestickSeries) return;

    // Pour les ticks en temps réel, on peut mettre à jour la dernière bougie
    // ou créer une nouvelle série de prix en temps réel
    console.log('[Chart] New tick:', tick);
  }

  setTimeframe(timeframe: string) {
    // Le changement de timeframe est géré par le parent
    // Cette méthode peut être utilisée pour ajuster l'affichage
    console.log('[Chart] Timeframe changed to:', timeframe);
  }

  destroy() {
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
      this.candlestickSeries = null;
    }
  }
}
