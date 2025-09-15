"use client";

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatPercent, calculatePnLColor } from '@/lib/overview';

interface KPICardProps {
  title: string;
  value: number;
  format: 'currency' | 'percent' | 'number';
  trend?: number;
  showTrend?: boolean;
}

export function KPICard({ title, value, format, trend, showTrend }: KPICardProps) {
  const formatValue = (val: number, fmt: string) => {
    switch (fmt) {
      case 'currency':
        return formatCurrency(val);
      case 'percent':
        return formatPercent(val);
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    if (!trend || trend === 0) return null;
    return trend > 0 ? (
      <TrendingUp className="w-3 h-3" />
    ) : (
      <TrendingDown className="w-3 h-3" />
    );
  };

  const getTrendColor = () => {
    if (!trend || trend === 0) return 'text-white/60';
    return calculatePnLColor(trend);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="glass p-6 hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white/80">{title}</h3>
        {showTrend && trend !== undefined && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-xs font-medium">
              {format === 'currency' ? formatCurrency(trend) : formatPercent(trend)}
            </span>
          </div>
        )}
      </div>
      
      <div className="text-2xl font-bold text-white">
        {formatValue(value, format)}
      </div>
      
      {!showTrend && trend !== undefined && (
        <div className={`text-sm mt-1 ${getTrendColor()}`}>
          {format === 'currency' ? formatCurrency(trend) : formatPercent(trend)}
        </div>
      )}
    </motion.div>
  );
}
