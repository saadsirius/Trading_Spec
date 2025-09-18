import { useState, useEffect, useCallback } from 'react';
import type { AIAlert } from '@/types';
import { aiAlertRateLimit, globalAlertRateLimit, getRateLimitKey } from '@/lib/rateLimit';
import { trackAlertFired } from '@/lib/analytics/Analytics';
import { showWarning, showInfo } from '@/lib/toast/ToastService';

export function useAIAlerts() {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // AI Alert evaluation with rate limiting and guards
  const evaluateAlert = useCallback(async (
    symbol: string,
    currentPrice: number,
    historicalData: number[]
  ): Promise<AIAlert | null> => {
    // Check rate limits
    const symbolKey = getRateLimitKey('alert', symbol);
    const globalKey = getRateLimitKey('alert', 'global');

    if (!aiAlertRateLimit.isAllowed(symbolKey)) {
      console.log(`Alert rate limited for ${symbol}`);
      return null;
    }

    if (!globalAlertRateLimit.isAllowed(globalKey)) {
      console.log('Global alert rate limit exceeded');
      return null;
    }

    setIsEvaluating(true);

    try {
      // Simple AI alert logic (replace with your actual AI model)
      const priceChange = historicalData.length > 1 
        ? (currentPrice - historicalData[historicalData.length - 2]) / historicalData[historicalData.length - 2]
        : 0;

      const volatility = historicalData.length > 10
        ? calculateVolatility(historicalData.slice(-10))
        : 0;

      // Generate alert based on simple rules
      let alert: AIAlert | null = null;

      // High volatility alert
      if (volatility > 0.05) {
        alert = {
          symbol,
          score: Math.min(volatility * 10, 1),
          rule: 'high_volatility',
          confidence: 0.8,
          timestamp: new Date().toISOString(),
          message: `High volatility detected: ${(volatility * 100).toFixed(2)}%`,
          actionable: false,
        };
      }
      // Significant price movement alert
      else if (Math.abs(priceChange) > 0.03) {
        alert = {
          symbol,
          score: Math.min(Math.abs(priceChange) * 20, 1),
          rule: 'price_movement',
          confidence: 0.7,
          timestamp: new Date().toISOString(),
          message: `Significant price movement: ${(priceChange * 100).toFixed(2)}%`,
          actionable: false,
        };
      }

      // Only proceed if confidence >= 0.6 (guard)
      if (alert && alert.confidence >= 0.6) {
        // Track the alert
        trackAlertFired(alert.symbol, alert.score, alert.rule);

        // Show appropriate toast
        if (alert.score > 0.8) {
          showWarning('AI Alert', alert.message);
        } else {
          showInfo('AI Alert', alert.message);
        }

        // Add to alerts list
        setAlerts(prev => [alert!, ...prev.slice(0, 49)]); // Keep last 50 alerts

        return alert;
      }

      return null;

    } catch (error) {
      console.error('Error evaluating AI alert:', error);
      return null;
    } finally {
      setIsEvaluating(false);
    }
  }, []);

  // Clear old alerts (older than 1 hour)
  const clearOldAlerts = useCallback(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    setAlerts(prev => prev.filter(alert => alert.timestamp > oneHourAgo));
  }, []);

  // Clear old alerts every 5 minutes
  useEffect(() => {
    const interval = setInterval(clearOldAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clearOldAlerts]);

  return {
    alerts,
    isEvaluating,
    evaluateAlert,
    clearOldAlerts,
  };
}

// Helper function to calculate volatility
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance);
}
