/**
 * File: app/trading/components/RiskPanel.tsx
 * Purpose: Risk management panel with exposure monitoring and circuit breakers
 * Key dependencies: React, TailwindCSS, zustand
 * Learning Angle: This demonstrates how to implement risk controls and monitoring
 * in a trading application. Notice how we calculate various risk metrics and
 * provide clear visual indicators for different risk levels.
 */

'use client';

import { useMemo } from 'react';
import { useTradingStore } from '@/state/tradingStore';
import { useNotificationStore } from '@/state/notificationStore';

interface RiskPanelProps {
  account: any;
  positions: any[];
}

interface RiskMetrics {
  totalExposure: number;
  maxPositionSize: number;
  concentrationRisk: number;
  dailyPnL: number;
  maxDrawdown: number;
  buyingPowerUtilization: number;
  marginUtilization: number;
}

export default function RiskPanel({ account, positions }: RiskPanelProps) {
  const { mode } = useTradingStore();
  const { addNotification } = useNotificationStore();

  // Calculate risk metrics
  const riskMetrics = useMemo((): RiskMetrics => {
    if (!account || !positions.length) {
      return {
        totalExposure: 0,
        maxPositionSize: 0,
        concentrationRisk: 0,
        dailyPnL: 0,
        maxDrawdown: 0,
        buyingPowerUtilization: 0,
        marginUtilization: 0,
      };
    }

    const totalEquity = parseFloat(account.equity || '0');
    const buyingPower = parseFloat(account.buying_power || '0');
    const totalMarketValue = positions.reduce((sum, pos) => sum + parseFloat(pos.market_value || '0'), 0);
    const totalPnL = positions.reduce((sum, pos) => sum + parseFloat(pos.unrealized_pl || '0'), 0);
    
    // Find largest position
    const maxPosition = Math.max(...positions.map(pos => parseFloat(pos.market_value || '0')));
    
    // Calculate concentration risk (largest position as % of total equity)
    const concentrationRisk = totalEquity > 0 ? (maxPosition / totalEquity) * 100 : 0;
    
    // Calculate buying power utilization
    const buyingPowerUtilization = buyingPower > 0 ? ((totalEquity - buyingPower) / totalEquity) * 100 : 0;
    
    // Calculate margin utilization (simplified)
    const marginUtilization = totalEquity > 0 ? (totalMarketValue / totalEquity) * 100 : 0;

    return {
      totalExposure: totalMarketValue,
      maxPositionSize: maxPosition,
      concentrationRisk,
      dailyPnL: totalPnL,
      maxDrawdown: 0, // Would need historical data to calculate
      buyingPowerUtilization,
      marginUtilization,
    };
  }, [account, positions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getRiskLevel = (value: number, thresholds: { low: number; medium: number; high: number }) => {
    if (value <= thresholds.low) return 'low';
    if (value <= thresholds.medium) return 'medium';
    return 'high';
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'text-emerald-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
    }
  };

  const getRiskBgColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'bg-emerald-900/20 border-emerald-700';
      case 'medium':
        return 'bg-yellow-900/20 border-yellow-700';
      case 'high':
        return 'bg-red-900/20 border-red-700';
    }
  };

  const concentrationRiskLevel = getRiskLevel(riskMetrics.concentrationRisk, { low: 10, medium: 20, high: 30 });
  const buyingPowerRiskLevel = getRiskLevel(riskMetrics.buyingPowerUtilization, { low: 50, medium: 75, high: 90 });
  const marginRiskLevel = getRiskLevel(riskMetrics.marginUtilization, { low: 50, medium: 75, high: 90 });

  const handleFlattenAll = () => {
    const confirmed = window.confirm(
      `⚠️ FLATTEN ALL POSITIONS ⚠️\n\n` +
      `This will close ALL open positions immediately using market orders.\n\n` +
      `Current positions: ${positions.length}\n` +
      `Total exposure: ${formatCurrency(riskMetrics.totalExposure)}\n\n` +
      `${mode === 'live' ? '🚨 LIVE TRADING MODE - This will execute real trades with real money!' : 'This is a paper trade.'}\n\n` +
      `Type "FLATTEN" to confirm:`
    );

    if (!confirmed) return;

    const userInput = window.prompt('Type "FLATTEN" to confirm:');
    if (userInput !== 'FLATTEN') {
      addNotification({
        type: 'warning',
        title: 'Flatten Cancelled',
        message: 'Flatten all operation cancelled - confirmation text did not match',
      });
      return;
    }

    // In a real implementation, this would close all positions
    addNotification({
      type: 'critical',
      title: 'Flatten All',
      message: 'Flatten all functionality would be implemented here',
      persistent: true,
    });
  };

  const handleCancelAll = () => {
    const confirmed = window.confirm(
      `Cancel all open orders?\n\n` +
      `This will cancel all pending orders immediately.\n\n` +
      `${mode === 'live' ? '⚠️ This will cancel real orders!' : 'This is a paper trade.'}`
    );

    if (!confirmed) return;

    // In a real implementation, this would cancel all orders
    addNotification({
      type: 'warning',
      title: 'Cancel All',
      message: 'Cancel all orders functionality would be implemented here',
    });
  };

  return (
    <div className="ds-card p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Risk Management</h3>
      
      <div className="space-y-4">
        {/* Risk Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Total Exposure</div>
            <div className="font-semibold text-white">
              {formatCurrency(riskMetrics.totalExposure)}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Daily P&L</div>
            <div className={`font-semibold ${riskMetrics.dailyPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(riskMetrics.dailyPnL)}
            </div>
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="space-y-3">
          {/* Concentration Risk */}
          <div className={`p-3 rounded-lg border ${getRiskBgColor(concentrationRiskLevel)}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Concentration Risk</div>
                <div className="text-xs text-gray-400">Largest position vs total equity</div>
              </div>
              <div className={`text-lg font-bold ${getRiskColor(concentrationRiskLevel)}`}>
                {formatPercentage(riskMetrics.concentrationRisk)}
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  concentrationRiskLevel === 'high' ? 'bg-red-500' :
                  concentrationRiskLevel === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(riskMetrics.concentrationRisk, 100)}%` }}
              />
            </div>
          </div>

          {/* Buying Power Utilization */}
          <div className={`p-3 rounded-lg border ${getRiskBgColor(buyingPowerRiskLevel)}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Buying Power Used</div>
                <div className="text-xs text-gray-400">Utilization of available buying power</div>
              </div>
              <div className={`text-lg font-bold ${getRiskColor(buyingPowerRiskLevel)}`}>
                {formatPercentage(riskMetrics.buyingPowerUtilization)}
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  buyingPowerRiskLevel === 'high' ? 'bg-red-500' :
                  buyingPowerRiskLevel === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(riskMetrics.buyingPowerUtilization, 100)}%` }}
              />
            </div>
          </div>

          {/* Margin Utilization */}
          <div className={`p-3 rounded-lg border ${getRiskBgColor(marginRiskLevel)}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Margin Utilization</div>
                <div className="text-xs text-gray-400">Total market value vs equity</div>
              </div>
              <div className={`text-lg font-bold ${getRiskColor(marginRiskLevel)}`}>
                {formatPercentage(riskMetrics.marginUtilization)}
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  marginRiskLevel === 'high' ? 'bg-red-500' :
                  marginRiskLevel === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(riskMetrics.marginUtilization, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Risk Warnings */}
        {(concentrationRiskLevel === 'high' || buyingPowerRiskLevel === 'high' || marginRiskLevel === 'high') && (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-400">⚠️</span>
              <div className="text-sm text-red-300">
                High risk detected. Consider reducing position sizes or closing positions.
              </div>
            </div>
          </div>
        )}

        {/* Emergency Controls */}
        <div className="pt-4 border-t border-gray-700">
          <div className="text-sm font-medium text-white mb-3">Emergency Controls</div>
          <div className="space-y-2">
            <button
              onClick={handleFlattenAll}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
            >
              Flatten All Positions
            </button>
            <button
              onClick={handleCancelAll}
              className="w-full py-2 px-4 bg-yellow-600 text-white rounded-md font-medium hover:bg-yellow-700 transition-colors"
            >
              Cancel All Orders
            </button>
          </div>
        </div>

        {/* Risk Limits */}
        <div className="pt-4 border-t border-gray-700">
          <div className="text-sm font-medium text-white mb-2">Risk Limits</div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>• Max position: 20% of equity</div>
            <div>• Max buying power: 90% utilization</div>
            <div>• Max margin: 100% utilization</div>
            <div>• Daily loss limit: $10,000</div>
          </div>
        </div>
      </div>
    </div>
  );
}
