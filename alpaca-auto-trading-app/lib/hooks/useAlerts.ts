'use client';
import { useState, useEffect, useCallback } from 'react';
import { AiAlert } from '@/types/alerts';
import { alertsEngine } from '@/lib/services/AlertsEngine';
import { analytics } from '@/lib/services/AnalyticsService';

export function useAlerts() {
  const [alerts, setAlerts] = useState<AiAlert[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);

  // Simulation d'alertes IA pour les tests
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      // Génère une alerte de test aléatoire
      const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL'];
      const kinds = ['breakout', 'pullback', 'rsiReentry', 'emaCross', 'volSpike'] as const;
      
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const confidence = 0.6 + Math.random() * 0.4; // 0.6-1.0
      
      const alert = alertsEngine.generateTestAlert(symbol, kind, confidence);
      
      if (alert.actionable) {
        setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Garde max 10 alertes
        
        // Analytics
        analytics.track('alert.ia.suggested', {
          symbol: alert.symbol,
          kind: alert.kind,
          confidence: alert.confidence,
          actionable: alert.actionable
        });
      }
    }, 10000); // Génère une alerte toutes les 10s

    return () => clearInterval(interval);
  }, [isEnabled]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    
    analytics.track('alert.ia.dismissed', { alertId: id });
  }, []);

  const confirmAlert = useCallback((id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      setAlerts(prev => prev.filter(a => a.id !== id));
      
      analytics.track('alert.ia.confirmed', {
        alertId: id,
        symbol: alert.symbol,
        kind: alert.kind,
        confidence: alert.confidence
      });
      
      // TODO: Pré-remplir le ticket d'ordre
      console.log('[Alert] Confirmed, pre-filling order ticket:', alert);
    }
  }, [alerts]);

  const clearAll = useCallback(() => {
    setAlerts([]);
    analytics.track('alert.ia.cleared');
  }, []);

  return {
    alerts,
    isEnabled,
    setIsEnabled,
    dismissAlert,
    confirmAlert,
    clearAll
  };
}
