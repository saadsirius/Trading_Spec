// ─────────────────────────────────────────────────────────────────────────────
// File: components/insights/WhyInvest.tsx
// Purpose: High-quality "Why Invest" panel with clear logic, a11y, strong typing,
//          memoized computations, and test hooks. Safe defaults + DS-friendly classes.
// Notes:
// - All derivations are pure helpers (exported) → easy to unit test.
// - Stable render: memoized lists + simple structural motion.
// - A11y: labelled regions, icons aria-hidden, semantic lists.
// - Styling: uses your DS utility classes (glass, text-support, text-danger-400, etc.).
// ─────────────────────────────────────────────────────────────────────────────

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  DollarSign,
  Activity,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
export type InstrumentType = 'STOCK' | 'ETF' | 'CRYPTO' | 'CFD';

export interface Instrument {
  symbol: string;
  name: string;
  type: InstrumentType;
  sector?: string;
  region?: string;
  price: number;
  changePercent: number; // e.g. 0.012 = +1.2%
  marketCap?: number;
  expenseRatio?: number; // 0.003 = 0.30%
  dividendYield?: number;
  volatility?: number; // e.g. 0.2 = 20%
  beta?: number;
  liquidityScore?: number; // 0-100
  tags?: string[];
}

interface WhyInvestProps {
  instrument: Instrument;
  className?: string;
  title?: string; // override "Why Invest"
  // If true, shows dividend information when available
  showDividend?: boolean;
}

// ── Pure helpers (exported for tests) ────────────────────────────────────────
export function buildInvestmentThesis(i: Instrument): string[] {
  const { type, sector, region, marketCap } = i;
  const list: string[] = [];

  switch (type) {
    case 'STOCK': {
      list.push(`Strong fundamentals in ${sector || 'diversified'} sector`);
      if (typeof marketCap === 'number') {
        if (marketCap > 1e12) list.push('Large-cap stability with blue-chip characteristics');
        else if (marketCap < 2e9) list.push('Small-cap growth potential with higher volatility');
      }
      break;
    }
    case 'ETF': {
      list.push(`Diversified exposure to ${sector || region || 'a market segment'}`);
      list.push('Low-cost, passive exposure to benchmark performance');
      break;
    }
    case 'CRYPTO': {
      list.push('Digital asset exposure to decentralized technology adoption');
      list.push('High volatility with asymmetric return potential');
      break;
    }
    case 'CFD': {
      list.push('Leveraged exposure without holding the underlying asset');
      list.push('Flexible long/short positioning');
      break;
    }
  }

  return list.slice(0, 2);
}

export function buildRiskFactors(i: Instrument): string[] {
  const { type, volatility, liquidityScore } = i;
  const list: string[] = [];

  // Volatility
  if (typeof volatility === 'number') {
    if (volatility > 0.3) list.push('High volatility may lead to significant price swings');
    else if (volatility < 0.1) list.push('Low volatility may limit upside potential');
  }

  // Liquidity
  if (typeof liquidityScore === 'number' && liquidityScore < 50) {
    list.push('Limited liquidity may impact order execution and slippage');
  }

  // Type specifics
  if (type === 'CFD') list.push('Leverage amplifies both gains and losses');
  if (type === 'CRYPTO') list.push('Regulatory uncertainty and sentiment-driven moves');
  if (type === 'ETF') list.push('Tracking error and fund management risks');

  return list.slice(0, 2);
}

export function pickInvestmentHorizon(i: Instrument): string {
  const { type, volatility } = i;
  if (type === 'CRYPTO' || (typeof volatility === 'number' && volatility > 0.25)) {
    return 'Short to Medium Term (1–12 months)';
  }
  if (type === 'ETF' || (typeof volatility === 'number' && volatility < 0.15)) {
    return 'Long Term (3+ years)';
  }
  return 'Medium Term (1–3 years)';
}

export function describeFees(i: Instrument): string {
  const { type, expenseRatio } = i;
  if (type === 'ETF' && typeof expenseRatio === 'number') {
    return `${(expenseRatio * 100).toFixed(2)}% annual expense ratio`;
  }
  if (type === 'CFD') return 'Spread-based fees; check overnight financing';
  if (type === 'CRYPTO') return 'Exchange fees typically 0.1–0.5%';
  return 'Standard brokerage commissions apply';
}

export function labelLiquidity(i: Instrument): 'High' | 'Good' | 'Moderate' | 'Low' | 'Unknown' {
  const s = i.liquidityScore;
  if (typeof s !== 'number') return 'Unknown';
  if (s >= 80) return 'High';
  if (s >= 60) return 'Good';
  if (s >= 40) return 'Moderate';
  return 'Low';
}

export function labelVolatility(v?: number): 'High' | 'Medium' | 'Low' | 'Unknown' {
  if (typeof v !== 'number') return 'Unknown';
  if (v > 0.25) return 'High';
  if (v > 0.15) return 'Medium';
  return 'Low';
}

export function formatPct(p: number): string {
  const sign = p >= 0 ? '+' : '';
  return `${sign}${(p * 100).toFixed(2)}%`;
}

export function formatUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function WhyInvest({
  instrument,
  className = '',
  title = 'Why Invest',
  showDividend = true,
}: WhyInvestProps) {
  // Precompute all derived views in one pass
  const {
    theses,
    risks,
    horizon,
    fees,
    liquidity,
    volLabel,
    priceStr,
    pctStr,
    isUp,
  } = useMemo(() => {
    const theses = buildInvestmentThesis(instrument);
    const risks = buildRiskFactors(instrument);
    const horizon = pickInvestmentHorizon(instrument);
    const fees = describeFees(instrument);
    const liquidity = labelLiquidity(instrument);
    const volLabel = labelVolatility(instrument.volatility);
    const priceStr = formatUsd(instrument.price);
    const pctStr = formatPct(instrument.changePercent);
    const isUp = instrument.changePercent >= 0;
    return { theses, risks, horizon, fees, liquidity, volLabel, priceStr, pctStr, isUp };
  }, [instrument]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`glass p-6 ${className}`}
      role="region"
      aria-label={`${title} for ${instrument.symbol}`}
      data-testid="why-invest"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isUp ? 'bg-support/20 text-support' : 'bg-danger-500/20 text-danger-400'
            }`}
            aria-label={`Change ${pctStr}`}
          >
            {pctStr}
          </span>
          <span className="text-xs text-white/70" aria-label={`Last price ${priceStr}`}>
            {priceStr}
          </span>
        </div>
      </div>

      {/* Investment Thesis */}
      <Block
        icon={<TrendingUp className="w-4 h-4 text-support" aria-hidden />}
        title="Investment Thesis"
        testId="thesis"
      >
        <ul className="space-y-1 ml-6 list-none">
          {theses.map((t, idx) => (
            <li key={idx} className="text-sm text-white/80">
              {t}
            </li>
          ))}
        </ul>
      </Block>

      {/* Key Risks */}
      <Block
        icon={<AlertTriangle className="w-4 h-4 text-accent" aria-hidden />}
        title="Key Risks"
        className="mt-3"
        testId="risks"
      >
        <ul className="space-y-1 ml-6 list-disc marker:text-accent/80">
          {risks.map((r, idx) => (
            <li key={idx} className="text-sm text-white/80">
              {r}
            </li>
          ))}
        </ul>
      </Block>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4 text-sm mt-4">
        <Detail
          icon={<Clock className="w-4 h-4 text-secondary" aria-hidden />}
          label="Horizon"
          value={horizon}
          testId="horizon"
        />
        <Detail
          icon={<DollarSign className="w-4 h-4 text-primary" aria-hidden />}
          label="Fees"
          value={fees}
          testId="fees"
        />
        <Detail
          icon={<Activity className="w-4 h-4 text-support" aria-hidden />}
          label="Liquidity"
          value={liquidity}
          valueClass={
            liquidity === 'High'
              ? 'text-support'
              : liquidity === 'Good'
              ? 'text-secondary'
              : liquidity === 'Moderate'
              ? 'text-warning-500'
              : 'text-accent'
          }
          testId="liquidity"
        />
        <Detail
          icon={
            (instrument.volatility ?? 0) >= 0.15 ? (
              <TrendingDown className="w-4 h-4 text-warning-500" aria-hidden />
            ) : (
              <TrendingDown className="w-4 h-4 text-white/60" aria-hidden />
            )
          }
          label="Volatility"
          value={volLabel}
          testId="volatility"
        />

        {/* Optional dividend (if provided, for stocks/ETFs) */}
        {showDividend &&
          typeof instrument.dividendYield === 'number' &&
          (instrument.type === 'STOCK' || instrument.type === 'ETF') && (
            <Detail
              icon={<DollarSign className="w-4 h-4 text-emerald-400" aria-hidden />}
              label="Dividend Yield"
              value={`${(instrument.dividendYield * 100).toFixed(2)}%`}
              testId="dividend"
            />
          )}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-xs text-white/50 text-center leading-relaxed">
          This analysis is for informational purposes only and not investment advice. Paper-trade your
          ideas and review your risk tolerance before committing real capital.
        </p>
      </div>
    </motion.section>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────────
function Block({
  icon,
  title,
  children,
  className = '',
  testId,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
  testId?: string;
}) {
  return (
    <div className={className} data-testid={testId}>
      <div className="flex items-center mb-2">
        {icon}
        <span className="text-sm font-medium text-white ml-2">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
  valueClass = 'text-white',
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  testId?: string;
}) {
  return (
    <div className="flex items-start gap-2" data-testid={testId}>
      {icon}
      <div>
        <span className="text-white/60">{label}:</span>{' '}
        <span className={valueClass}>{value}</span>
      </div>
    </div>
  );
}