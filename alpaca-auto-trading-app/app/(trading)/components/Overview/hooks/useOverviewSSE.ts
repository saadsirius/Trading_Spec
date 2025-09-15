"use client";

import { useEffect, useState, useCallback } from 'react';
import { SSEEvent } from '@/lib/types/overview';

interface UseOverviewSSEReturn {
  isConnected: boolean;
  lastUpdate?: string;
  error?: string;
}

export function useOverviewSSE(
  mode: 'paper' | 'live',
  onMessage: (data: any) => void
): UseOverviewSSEReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>();
  const [error, setError] = useState<string>();
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [eventSource, setEventSource] = useState<EventSource>();

  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  const connect = useCallback(() => {
    try {
      // Close existing connection
      if (eventSource) {
        eventSource.close();
      }

      const es = new EventSource(`/api/overview/stream?mode=${mode}`);
      setEventSource(es);

      es.onopen = () => {
        setIsConnected(true);
        setError(undefined);
        setReconnectAttempts(0);
        console.log(`SSE connected for ${mode} mode`);
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastUpdate(new Date().toISOString());
          
          // Handle different message types
          switch (event.lastEventId) {
            case 'KPI_UPDATE':
              onMessage({ kpis: data });
              break;
            case 'ORDER_UPSERT':
              onMessage({ orders: [data] });
              break;
            case 'POSITION_UPSERT':
              onMessage({ positions: [data] });
              break;
            case 'NOTIFICATION_PUSH':
              onMessage({ notifications: [data] });
              break;
            case 'WATCHLIST_UPDATE':
              onMessage({ watchlist: data });
              break;
            case 'ping':
              // Heartbeat - just update timestamp
              break;
            default:
              console.log('Unknown SSE event type:', event.lastEventId);
          }
        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };

      es.onerror = (event) => {
        setIsConnected(false);
        console.error('SSE connection error:', event);
        
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts);
          setError(`Connection lost. Reconnecting in ${delay/1000}s...`);
          
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        } else {
          setError('Connection failed. Please refresh the page.');
        }
      };

    } catch (err) {
      setError('Failed to establish connection');
      console.error('SSE connection error:', err);
    }
  }, [mode, onMessage, eventSource, reconnectAttempts]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  return {
    isConnected,
    lastUpdate,
    error,
  };
}
