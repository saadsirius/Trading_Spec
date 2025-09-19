'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { PropsWithChildren, useEffect } from 'react';
import { webVitals } from '@/lib/performance/web-vitals';
import { prefetchManager } from '@/lib/performance/prefetch';

const queryClient = new QueryClient({
  defaultOptions: { 
    queries: { 
      staleTime: 30_000, 
      refetchOnWindowFocus: false, 
      retry: 2 
    } 
  }
});

function ErrorBoundary({ children }: PropsWithChildren) {
  const [err, setErr] = React.useState<Error | null>(null);
  if (err) {
    return (
      <div className="p-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
        <div className="font-semibold mb-1">Une erreur s'est produite</div>
        <pre className="whitespace-pre-wrap">{err.message}</pre>
      </div>
    );
  }
  return <React.Suspense fallback={<div className="p-4 text-sm text-gray-500">Chargement…</div>}>
    <ErrorCatcher onError={setErr}>{children}</ErrorCatcher>
  </React.Suspense>;
}

function ErrorCatcher({ children, onError }: PropsWithChildren & { onError: (e: Error)=>void }) {
  useEffect(() => {
    const h = (e: ErrorEvent) => onError(e.error || new Error(String(e.message)));
    window.addEventListener('error', h);
    return () => window.removeEventListener('error', h);
  }, [onError]);
  return <>{children}</>;
}

// Mood Controller Hook
function useMoodController() {
  const [mood, setMood] = React.useState<'happy' | 'neutral' | 'stressed' | 'excited'>('neutral');
  
  useEffect(() => {
    // Simple mood detection based on time and user activity
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 16) {
      setMood('excited'); // Market hours
    } else if (hour >= 6 && hour <= 8) {
      setMood('happy'); // Morning
    } else if (hour >= 17 && hour <= 20) {
      setMood('neutral'); // Evening
    } else {
      setMood('stressed'); // Late night/early morning
    }
  }, []);

  return { mood, setMood };
}

// Performance Monitor Component
function PerformanceMonitor() {
  useEffect(() => {
    // Initialize Web Vitals monitoring
    webVitals.start();
    
    // Initialize prefetch manager
    prefetchManager.observeElement('[data-prefetch]', (element) => {
      const url = element.getAttribute('data-prefetch');
      if (url) {
        prefetchManager.prefetch(url);
      }
    });

    return () => {
      webVitals.stop();
    };
  }, []);

  return null;
}

export default function Providers({ children }: PropsWithChildren) {
  const { mood } = useMoodController();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <PerformanceMonitor />
        <div data-mood={mood} className="min-h-screen">
          {children}
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
