/**
 * File: src/components/ToastRail.tsx
 * Description: Toast notification rail component.
 */
'use client';

import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastRail() {
  useEffect(() => {
    // Initialize toast system
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #374151',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}