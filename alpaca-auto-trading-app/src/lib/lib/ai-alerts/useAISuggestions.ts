'use client';
import { useEffect, useState } from 'react';
import { popAlerts } from './engine';
import type { AIAlert } from './types';

export function useAISuggestions() {
  const [suggestions, setSuggestions] = useState<AIAlert[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      const next = popAlerts();
      if (next.length) setSuggestions(prev => [...prev, ...next]);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return {
    suggestions,
    dismiss: (id: string) => setSuggestions(prev => prev.filter(s => s.id !== id)),
    confirm: (id: string) => setSuggestions(prev => prev.filter(s => s.id !== id)),
  };
}
