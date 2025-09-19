import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

// Loading component with animation
const LoadingSpinner = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center justify-center p-8"
  >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-2 text-gray-400">Loading...</span>
  </motion.div>
);

// Lazy load heavy components
export const LazyDashboard = lazy(() => import('../pages/Dashboard'));
export const LazyPortfolio = lazy(() => import('../pages/Portfolio'));
export const LazySearch = lazy(() => import('../pages/Search'));
export const LazyScreener = lazy(() => import('../pages/Screener'));
export const LazyCharts = lazy(() => import('../components/Charts'));
export const LazyBacktest = lazy(() => import('../components/Backtest'));
export const LazyAlerts = lazy(() => import('../components/Alerts'));
export const LazyMiddleware = lazy(() => import('../pages/Middleware'));
export const LazyROIOverview = lazy(() => import('../pages/ROIOverview'));
export const LazyAISystems = lazy(() => import('../pages/AISystems'));

// Higher-order component for lazy loading with error boundary
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return React.memo((props: P) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  ));
};

// Preload components on hover
export const preloadComponent = (importFn: () => Promise<any>) => {
  return () => {
    importFn();
  };
};

// Route-based code splitting
export const routeComponents = {
  dashboard: () => import('../pages/Dashboard'),
  portfolio: () => import('../pages/Portfolio'),
  search: () => import('../pages/Search'),
  screener: () => import('../pages/Screener'),
  charts: () => import('../components/Charts'),
  backtest: () => import('../components/Backtest'),
  alerts: () => import('../components/Alerts'),
  middleware: () => import('../pages/Middleware'),
  roi: () => import('../pages/ROIOverview'),
  ai: () => import('../pages/AISystems'),
};

// Preload critical routes
export const preloadCriticalRoutes = () => {
  // Preload dashboard and search on app start
  routeComponents.dashboard();
  routeComponents.search();
};
