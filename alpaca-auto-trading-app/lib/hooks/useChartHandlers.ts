'use client';
import { useCallback, useRef } from 'react';
import { PriceClick } from '@/types/market';
import { analytics } from '@/lib/services/AnalyticsService';

// Throttle function
function throttle<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return ((...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  }) as T;
}

// Debounce function
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

export function useChartHandlers() {
  const lastPriceClick = useRef<PriceClick | null>(null);

  const onPriceClick = useCallback(
    throttle((e: PriceClick) => {
      // 1) Feedback visuel
      console.log('[Chart] Price clicked:', e);
      
      // 2) Analytics
      analytics.track('chart.priceClick', {
        symbol: e.symbol,
        price: e.price,
        source: e.source
      });
      
      // 3) Stocker pour pré-remplir ticket d'ordre/alerte
      lastPriceClick.current = e;
      
    }, 100), // Throttle ≥ 100ms
    []
  );

  const onTimeframeChange = useCallback(
    debounce((symbol: string, timeframe: '1m'|'5m'|'15m'|'1h'|'1d') => {
      console.log('[Chart] Timeframe changed:', { symbol, timeframe });
      
      // Analytics
      analytics.track('chart.timeframeChange', {
        symbol,
        timeframe
      });
      
      // TODO: Reload candles + resample + re-render
      // Cette logique sera implémentée dans l'adaptateur de chart
      
    }, 300), // Debounce 300ms
    []
  );

  const onCrosshairMove = useCallback(
    throttle((symbol: string, price: number, timestamp: number) => {
      // Analytics pour tracking de l'usage
      analytics.track('chart.crosshairMove', {
        symbol,
        price
      });
    }, 100), // Throttle ≥ 100ms
    []
  );

  const getLastPriceClick = useCallback(() => {
    return lastPriceClick.current;
  }, []);

  return {
    onPriceClick,
    onTimeframeChange,
    onCrosshairMove,
    getLastPriceClick
  };
}
