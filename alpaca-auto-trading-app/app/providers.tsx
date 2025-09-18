'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { PropsWithChildren, useEffect } from 'react';

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

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </QueryClientProvider>
  );
}
