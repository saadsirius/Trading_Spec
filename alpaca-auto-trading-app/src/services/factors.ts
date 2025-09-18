import type { Factors } from '@/src/types/market';
import { clamp } from '@/src/utils/num';

const toPercentile = (x: number, min: number, max: number) => clamp(((x - min) / (max - min)) * 100, 0, 100);
const invNorm = (x: number, min: number, max: number) => clamp(((max - x) / (max - min)) * 100, 0, 100);

export interface Fundamentals {
  perf6m: number; // %
  perf12m: number; // %
  evToEbitda: number;
  pb: number;
  pe: number;
  roe: number; // %
  roic: number; // %
  netMargin: number; // %
  epsStdDev?: number; // volatilité earnings
  vol30: number; // %
  vol90: number; // %
  maxDrawdown: number; // % négatif
  revCAGR3y?: number; // %
  epsCAGR3y?: number; // %
}

export function computeFactors(f: Fundamentals): Factors {
  const momentum = (toPercentile(f.perf6m, -50, 100) * 0.4) + (toPercentile(f.perf12m, -80, 150) * 0.6);
  const value = (invNorm(f.evToEbitda, 2, 40)*0.4) + (invNorm(f.pb, 0.5, 15)*0.3) + (invNorm(f.pe, 3, 60)*0.3);
  const quality = (toPercentile(f.roe, -10, 40)*0.4) + (toPercentile(f.roic, -5, 30)*0.3) + (toPercentile(f.netMargin, -20, 40)*0.3);
  const risk = (invNorm(f.vol30, 5, 120)*0.4) + (invNorm(f.vol90, 5, 140)*0.3) + (invNorm(Math.abs(f.maxDrawdown), 5, 85)*0.3);
  const growth = (toPercentile(f.revCAGR3y ?? 0, -10, 60)*0.5) + (toPercentile(f.epsCAGR3y ?? 0, -20, 80)*0.5);
  return {
    momentum: clamp(momentum,0,100),
    value: clamp(value,0,100),
    quality: clamp(quality,0,100),
    risk: clamp(risk,0,100),
    growth: clamp(growth,0,100)
  };
}
