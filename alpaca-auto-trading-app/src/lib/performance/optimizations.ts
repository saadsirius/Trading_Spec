/**
 * File: src/lib/performance/optimizations.ts
 * Description: Performance optimization utilities.
 */
import { debounce, throttle } from 'lodash';

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export function createDebounced<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: DebounceOptions
): T {
  return debounce(func, wait, options) as T;
}

export function createThrottled<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options?: ThrottleOptions
): T {
  return throttle(func, wait, options) as T;
}

export function measurePerformance<T extends (...args: any[]) => any>(
  func: T,
  name: string
): T {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${end - start}ms`);
    }
    
    return result;
  }) as T;
}

export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc);
}

export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

export function createResizeObserver(
  callback: ResizeObserverCallback
): ResizeObserver {
  return new ResizeObserver(callback);
}

export function createPerformanceObserver(
  callback: PerformanceObserverCallback,
  entryTypes: string[]
): PerformanceObserver {
  return new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entryTypes.includes(entry.entryType)) {
        callback(list, entry);
      }
    });
  });
}

export function measureWebVitals(): void {
  if (typeof window === 'undefined') return;

  const observer = createPerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
      } else if (entry.entryType === 'first-input') {
        console.log('FID:', entry.processingStart - entry.startTime);
      } else if (entry.entryType === 'layout-shift') {
        console.log('CLS:', (entry as any).value);
      }
    });
  }, ['largest-contentful-paint', 'first-input', 'layout-shift']);

  observer.observe();
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadFont(family: string, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const font = new FontFace(family, `url(${url})`);
    font.load().then(resolve).catch(reject);
  });
}

export function createVirtualScroller<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
): {
  visibleItems: T[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
} {
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = 0;
  const endIndex = Math.min(startIndex + visibleCount, items.length);
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
  };
}

export function createMemoizedSelector<T, R>(
  selector: (state: T) => R,
  equalityFn?: (a: R, b: R) => boolean
): (state: T) => R {
  let lastResult: R;
  let lastState: T;

  return (state: T) => {
    if (lastState === state) {
      return lastResult;
    }

    const result = selector(state);
    
    if (equalityFn ? equalityFn(result, lastResult) : result === lastResult) {
      return lastResult;
    }

    lastResult = result;
    lastState = state;
    return result;
  };
}

export function createBatchUpdater<T>(
  updateFn: (items: T[]) => void,
  delay = 16
): (item: T) => void {
  let queue: T[] = [];
  let timeoutId: number | null = null;

  const flush = () => {
    if (queue.length > 0) {
      updateFn([...queue]);
      queue = [];
    }
    timeoutId = null;
  };

  return (item: T) => {
    queue.push(item);
    
    if (timeoutId === null) {
      timeoutId = window.setTimeout(flush, delay);
    }
  };
}

export function createIdleCallback(
  callback: () => void,
  timeout = 5000
): number {
  if ('requestIdleCallback' in window) {
    return (window as any).requestIdleCallback(callback, { timeout });
  } else {
    return window.setTimeout(callback, 1);
  }
}

export function createIdleCallbackCancel(id: number): void {
  if ('cancelIdleCallback' in window) {
    (window as any).cancelIdleCallback(id);
  } else {
    window.clearTimeout(id);
  }
}