/**
 * File: src/components/LazyComponents.tsx
 * Description: Lazy-loaded components for code splitting.
 */
'use client';

import { lazy, Suspense } from 'react';
import { createLazyComponent } from '@/lib/performance/optimizations';

// Lazy load heavy components
export const LazyChart = createLazyComponent(() => import('@/components/charts/EquityChart'));
export const LazyBacktest = createLazyComponent(() => import('@/components/backtest/BacktestPanel'));
export const LazyScreener = createLazyComponent(() => import('@/components/InstrumentScreener'));
export const LazyPortfolio = createLazyComponent(() => import('@/components/portfolio/PortfolioView'));
export const LazyAlerts = createLazyComponent(() => import('@/components/alerts/AlertsPanel'));
export const LazyNews = createLazyComponent(() => import('@/components/news/NewsPanel'));
export const LazyCalendar = createLazyComponent(() => import('@/components/calendar/CalendarPanel'));
export const LazySettings = createLazyComponent(() => import('@/components/settings/SettingsPanel'));

// Loading fallback component
export function LoadingFallback({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-gray-400">{message}</span>
    </div>
  );
}

// HOC for lazy loading with fallback
export function withLazyLoading<T extends React.ComponentType<any>>(
  Component: React.LazyExoticComponent<T>,
  fallback?: React.ReactNode
) {
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback || <LoadingFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Preload components for better UX
export function preloadComponents() {
  if (typeof window === 'undefined') return;

  // Preload components on user interaction
  const preloadOnHover = (importFunc: () => Promise<any>) => {
    let preloaded = false;
    return () => {
      if (!preloaded) {
        preloaded = true;
        importFunc();
      }
    };
  };

  // Add hover listeners to navigation items
  const navItems = document.querySelectorAll('[data-preload]');
  navItems.forEach((item) => {
    const preloadType = item.getAttribute('data-preload');
    if (preloadType) {
      item.addEventListener('mouseenter', preloadOnHover(() => {
        switch (preloadType) {
          case 'chart':
            return import('@/components/charts/EquityChart');
          case 'backtest':
            return import('@/components/backtest/BacktestPanel');
          case 'screener':
            return import('@/components/InstrumentScreener');
          case 'portfolio':
            return import('@/components/portfolio/PortfolioView');
          case 'alerts':
            return import('@/components/alerts/AlertsPanel');
          case 'news':
            return import('@/components/news/NewsPanel');
          case 'calendar':
            return import('@/components/calendar/CalendarPanel');
          case 'settings':
            return import('@/components/settings/SettingsPanel');
        }
      }));
    }
  });
}

// Initialize preloading
if (typeof window !== 'undefined') {
  // Preload on idle
  requestIdleCallback(() => {
    preloadComponents();
  });
}