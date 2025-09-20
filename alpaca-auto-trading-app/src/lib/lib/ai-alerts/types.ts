export type AIAlertKind = 'AI_TRADE_SUGGESTION' | 'AI_RISK_WARNING' | 'AI_TP_SL_ADJUST' | 'AI_PATTERN_DETECTED' | 'AI_COOLDOWN';

export interface AIAlertPayloadBase {
  id: string;           // uuid
  kind: AIAlertKind;
  symbol: string;
  createdAt: string;    // ISO
  confidence: number;   // 0..1
  source: 'chart_event' | 'backtest' | 'realtime_feed' | 'user_query';
  meta?: Record<string, unknown>;
}

export interface AITradeSuggestion extends AIAlertPayloadBase {
  kind: 'AI_TRADE_SUGGESTION';
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  size: { unit: 'shares' | 'fraction' | 'cash'; value: number };
  prices?: { limitPrice?: number; stopLoss?: number; takeProfit?: number };
  rationale: string;
}

export interface AIRiskWarning extends AIAlertPayloadBase {
  kind: 'AI_RISK_WARNING';
  riskType: 'volatility' | 'news' | 'drawdown' | 'liquidity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export type AIAlert = AITradeSuggestion | AIRiskWarning;
