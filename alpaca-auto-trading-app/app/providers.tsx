'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

let client: QueryClient | null = null;
function getClient() {
  if (!client) {
    client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,           // 1 min
          gcTime: 5 * 60_000,          // 5 min
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  }
  return client;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={getClient()}>{children}</QueryClientProvider>;
}