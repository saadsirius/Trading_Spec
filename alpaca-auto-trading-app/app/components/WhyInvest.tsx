"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, Clock, DollarSign, Activity } from "lucide-react";

interface WhyInvestProps {
  instrument: {
    symbol: string;
    name: string;
    type: string;
    sector?: string;
    region?: string;
    price: number;
    changePercent: number;
    marketCap?: number;
    expenseRatio?: number;
    dividendYield?: number;
    volatility?: number;
    beta?: number;
    liquidityScore?: number;
    tags?: string[];
  };
  className?: string;
}

export default function WhyInvest({ instrument, className = "" }: WhyInvestProps) {
  const getInvestmentThesis = () => {
    const { type, sector, region, marketCap, volatility } = instrument;
    
    const theses = [];
    
    // Type-based thesis
    switch (type) {
      case 'STOCK':
        theses.push(`Strong fundamentals in ${sector || 'diversified'} sector`);
        if (marketCap && marketCap > 1000000000000) {
          theses.push('Large-cap stability with blue-chip characteristics');
        } else if (marketCap && marketCap < 2000000000) {
          theses.push('Small-cap growth potential with higher volatility');
        }
        break;
      case 'ETF':
        theses.push(`Diversified exposure to ${sector || region || 'market segment'}`);
        theses.push('Low-cost passive investment vehicle');
        break;
      case 'CRYPTO':
        theses.push('Digital asset with decentralized technology adoption');
        theses.push('High volatility with asymmetric return potential');
        break;
      case 'CFD':
        theses.push('Leveraged exposure without owning underlying asset');
        theses.push('Flexible long/short positioning capabilities');
        break;
    }
    
    return theses.slice(0, 2);
  };

  const getRiskFactors = () => {
    const risks = [];
    const { type, volatility, beta, liquidityScore } = instrument;
    
    // Volatility risk
    if (volatility && volatility > 0.3) {
      risks.push('High volatility may lead to significant price swings');
    } else if (volatility && volatility < 0.1) {
      risks.push('Low volatility may limit upside potential');
    }
    
    // Liquidity risk
    if (liquidityScore && liquidityScore < 50) {
      risks.push('Limited liquidity may impact trade execution');
    }
    
    // Type-specific risks
    switch (type) {
      case 'CFD':
        risks.push('Leverage amplifies both gains and losses');
        break;
      case 'CRYPTO':
        risks.push('Regulatory uncertainty and market sentiment volatility');
        break;
      case 'ETF':
        risks.push('Tracking error and fund management risks');
        break;
    }
    
    return risks.slice(0, 2);
  };

  const getInvestmentHorizon = () => {
    const { type, volatility, beta } = instrument;
    
    if (type === 'CRYPTO' || (volatility && volatility > 0.25)) {
      return 'Short to Medium Term (1-12 months)';
    } else if (type === 'ETF' || (volatility && volatility < 0.15)) {
      return 'Long Term (3+ years)';
    } else {
      return 'Medium Term (1-3 years)';
    }
  };

  const getFees = () => {
    const { type, expenseRatio } = instrument;
    
    if (type === 'ETF' && expenseRatio) {
      return `${(expenseRatio * 100).toFixed(2)}% annual expense ratio`;
    } else if (type === 'CFD') {
      return 'Spread-based fees, no commission';
    } else if (type === 'CRYPTO') {
      return 'Exchange fees typically 0.1-0.5%';
    } else {
      return 'Standard brokerage commissions apply';
    }
  };

  const getLiquidityStatus = () => {
    const { liquidityScore } = instrument;
    
    if (!liquidityScore) return 'Unknown';
    
    if (liquidityScore >= 80) return 'High';
    if (liquidityScore >= 60) return 'Good';
    if (liquidityScore >= 40) return 'Moderate';
    return 'Low';
  };

  const theses = getInvestmentThesis();
  const risks = getRiskFactors();
  const horizon = getInvestmentHorizon();
  const fees = getFees();
  const liquidity = getLiquidityStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Why Invest</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            instrument.changePercent >= 0 
              ? 'bg-support/20 text-support' 
              : 'bg-danger-500/20 text-danger-400'
          }`}>
            {instrument.changePercent >= 0 ? '+' : ''}{instrument.changePercent.toFixed(2)}%
          </span>
          <span className="text-xs text-white/60">
            ${instrument.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Investment Thesis */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <TrendingUp className="w-4 h-4 text-support mr-2" />
          <span className="text-sm font-medium text-white">Investment Thesis</span>
        </div>
        <div className="space-y-1">
          {theses.map((thesis, index) => (
            <p key={index} className="text-sm text-white/80 ml-6">
              {thesis}
            </p>
          ))}
        </div>
      </div>

      {/* Risk Factors */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <AlertTriangle className="w-4 h-4 text-accent mr-2" />
          <span className="text-sm font-medium text-white">Key Risks</span>
        </div>
        <ul className="space-y-1">
          {risks.map((risk, index) => (
            <li key={index} className="text-sm text-white/80 ml-6 flex items-start">
              <span className="w-1 h-1 bg-accent rounded-full mt-2 mr-2 flex-shrink-0"></span>
              {risk}
            </li>
          ))}
        </ul>
      </div>

      {/* Investment Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-secondary mr-2" />
          <div>
            <span className="text-white/60">Horizon:</span>
            <span className="text-white ml-1">{horizon}</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 text-primary mr-2" />
          <div>
            <span className="text-white/60">Fees:</span>
            <span className="text-white ml-1 text-xs">{fees}</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <Activity className="w-4 h-4 text-support mr-2" />
          <div>
            <span className="text-white/60">Liquidity:</span>
            <span className={`ml-1 ${
              liquidity === 'High' ? 'text-support' :
              liquidity === 'Good' ? 'text-secondary' :
              liquidity === 'Moderate' ? 'text-warning-500' : 'text-accent'
            }`}>
              {liquidity}
            </span>
          </div>
        </div>

        {instrument.volatility && (
          <div className="flex items-center">
            <TrendingDown className="w-4 h-4 text-warning-500 mr-2" />
            <div>
              <span className="text-white/60">Volatility:</span>
              <span className="text-white ml-1">
                {instrument.volatility > 0.25 ? 'High' :
                 instrument.volatility > 0.15 ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-xs text-white/50 text-center">
          This analysis is for informational purposes only and not investment advice. 
          Always conduct your own research and consider your risk tolerance.
        </p>
      </div>
    </motion.div>
  );
}
