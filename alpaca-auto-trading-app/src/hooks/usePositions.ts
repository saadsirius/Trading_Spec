import { useState, useEffect, useCallback } from 'react';
import type { Position } from '@/types';

export function usePositions() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/alpaca/trading?action=positions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch positions');
      }
      
      const data = await response.json();
      setPositions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error fetching positions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPositions = useCallback(async (): Promise<boolean> => {
    try {
      await fetchPositions();
      return true;
    } catch (err) {
      console.error('Error refreshing positions:', err);
      return false;
    }
  }, [fetchPositions]);

  // Fetch positions on mount
  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Calculate portfolio metrics
  const portfolioMetrics = {
    totalValue: positions.reduce((sum, pos) => sum + parseFloat(pos.market_value), 0),
    totalPnL: positions.reduce((sum, pos) => sum + parseFloat(pos.unrealized_pl), 0),
    totalPnLPercent: positions.length > 0 
      ? positions.reduce((sum, pos) => sum + parseFloat(pos.unrealized_plpc), 0) / positions.length
      : 0,
    positionCount: positions.length,
  };

  return {
    positions,
    loading,
    error,
    refreshPositions,
    portfolioMetrics,
  };
}
